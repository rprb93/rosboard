#!/usr/bin/env python3

import asyncio
import importlib
import os
import threading
import time
import tornado, tornado.web, tornado.websocket
import traceback

if os.environ.get("ROS_VERSION") == "1":
    import rospy # ROS1
elif os.environ.get("ROS_VERSION") == "2":
    import rosboard.rospy2 as rospy # ROS2
else:
    print("ROS not detected. Please source your ROS environment\n(e.g. 'source /opt/ros/DISTRO/setup.bash')")
    exit(1)

from geometry_msgs.msg import Twist
from std_msgs.msg import Empty
from std_msgs.msg import UInt8, UInt8MultiArray
from std_msgs.msg import String
from rosgraph_msgs.msg import Log

from rosboard.serialization import ros2dict
from rosboard.subscribers.dmesg_subscriber import DMesgSubscriber
from rosboard.subscribers.processes_subscriber import ProcessesSubscriber
from rosboard.subscribers.system_stats_subscriber import SystemStatsSubscriber
from rosboard.subscribers.dummy_subscriber import DummySubscriber
from rosboard.handlers import ROSBoardSocketHandler, NoCacheStaticFileHandler

class ROSBoardNode(object):
    instance = None
    def __init__(self, node_name = "rosboard_node"):
        self.__class__.instance = self
        rospy.init_node(node_name)
        self.port = rospy.get_param("~port", 8888)

        # desired subscriptions of all the websockets connecting to this instance.
        # these remote subs are updated directly by "friend" class ROSBoardSocketHandler.
        # this class will read them and create actual ROS subscribers accordingly.
        # dict of topic_name -> set of sockets
        self.remote_subs = {}

        # actual ROS subscribers.
        # dict of topic_name -> ROS Subscriber
        self.local_subs = {}

        # minimum update interval per topic (throttle rate) amang all subscribers to a particular topic.
        # we can throw data away if it arrives faster than this
        # dict of topic_name -> float (interval in seconds)
        self.update_intervals_by_topic = {}

        # last time data arrived for a particular topic
        # dict of topic_name -> float (time in seconds)
        self.last_data_times_by_topic = {}

        if rospy.__name__ == "rospy2":
            # ros2 hack: need to subscribe to at least 1 topic
            # before dynamic subscribing will work later.
            # ros2 docs don't explain why but we need this magic.
            self.sub_rosout = rospy.Subscriber("/rosout", Log, lambda x:x)

        self.twist_pub = rospy.Publisher('/cmd_vel', Twist, queue_size=100)
        self.empty_pub = rospy.Publisher('/btAction', UInt8MultiArray, queue_size=100)
        self.rosbag_pub = rospy.Publisher('/rosbagAction', UInt8, queue_size=100)
        self.sendText_pub = rospy.Publisher('/sendText', String, queue_size=100)

        tornado_settings = {
            'debug': True,
            'static_path': os.path.join(os.path.dirname(os.path.realpath(__file__)), 'html')
        }

        tornado_handlers = [
                (r"/rosboard/v1", ROSBoardSocketHandler, {
                    "node": self,
                }),
                (r"/(.*)", NoCacheStaticFileHandler, {
                    "path": tornado_settings.get("static_path"),
                    "default_filename": "index.html"
                }),
        ]

        self.event_loop = None
        self.tornado_application = tornado.web.Application(tornado_handlers, **tornado_settings)
        asyncio.set_event_loop(asyncio.new_event_loop())
        self.event_loop = tornado.ioloop.IOLoop()
        self.tornado_application.listen(self.port)

        # allows tornado to log errors to ROS
        self.logwarn = rospy.logwarn
        self.logerr = rospy.logerr

        # tornado event loop. all the web server and web socket stuff happens here
        threading.Thread(target = self.event_loop.start, daemon = True).start()

        # loop to sync remote (websocket) subs with local (ROS) subs
        threading.Thread(target = self.sync_subs_loop, daemon = True).start()

        # loop to keep track of latencies and clock differences for each socket
        threading.Thread(target = self.pingpong_loop, daemon = True).start()

        # loop to send client joy message to ros topic

        # threading.Thread(target = self.joy_loop, daemon = True).start()

        threading.Thread(target = self.button_loop, daemon = True).start()

        threading.Thread(target = self.rosbag_loop, daemon = True).start()

        threading.Thread(target = self.sendText_loop, daemon = True).start()

        self.lock = threading.Lock()

        rospy.loginfo("ROSboard listening on :%d" % self.port)

    def start(self):
        rospy.spin()

    def get_msg_class(self, msg_type):
        """
        Given a ROS message type specified as a string, e.g.
            "std_msgs/Int32"
        or
            "std_msgs/msg/Int32"
        it imports the message class into Python and returns the class, i.e. the actual std_msgs.msg.Int32

        Returns none if the type is invalid (e.g. if user hasn't bash-sourced the message package).
        """
        try:
            msg_module, dummy, msg_class_name = msg_type.replace("/", ".").rpartition(".")
        except ValueError:
            rospy.logerr("invalid type %s" % msg_type)
            return None

        try:
            if not msg_module.endswith(".msg"):
                msg_module = msg_module + ".msg"
            return getattr(importlib.import_module(msg_module), msg_class_name)
        except Exception as e:
            rospy.logerr(str(e))
            return None
    
    def sendText_loop(self):
        """
        Receving Text message from client
        """

        msg = String()
        sendText = "0"

        msg.data = "0"

        while(True):
            time.sleep(1)
            self.sendText_pub.publish(msg)
            
            if not isinstance(ROSBoardSocketHandler.sendText_msg, dict):
                continue
            
            if 'text' in ROSBoardSocketHandler.sendText_msg:
                sendText = ROSBoardSocketHandler.sendText_msg['text']

            msg.data = sendText

    def rosbag_loop(self):
        """
        Receving Rosbag Action message from client
        """

        msg = UInt8()
        rosbagAction = 0
        last_rosbagAction = 0

        msg.data = 0

        while(True):
            time.sleep(1)
            self.rosbag_pub.publish(msg)
            
            if not isinstance(ROSBoardSocketHandler.rosbagAction_msg, dict):
                continue
            
            if 'action' in ROSBoardSocketHandler.rosbagAction_msg:
                rosbagAction = float(ROSBoardSocketHandler.rosbagAction_msg['action'])


            if (rosbagAction == 1) and (last_rosbagAction == 0):
                msg.data = 1
            elif (rosbagAction == 0) and (last_rosbagAction == 1):
                msg.data = 0

            last_rosbagAction = rosbagAction

    def button_loop(self):
        """
        Sending joy message from client
        """
        msg = UInt8MultiArray()

        button00 = 0
        button01 = 0
        button02 = 0
        button10 = 0
        button11 = 0
        button12 = 0
        button20 = 0
        button21 = 0
        button22 = 0

        msg.data = [button00, button01, button02, button10, button11, button12, button20, button21, button22]

        while True:
            time.sleep(1)
            self.empty_pub.publish(msg)
            
            if not isinstance(ROSBoardSocketHandler.button_msg, dict):
                continue

            if '00' in ROSBoardSocketHandler.button_msg:
                button00 = int(ROSBoardSocketHandler.button_msg['00'])

            if '01' in ROSBoardSocketHandler.button_msg:
                button01 = int(ROSBoardSocketHandler.button_msg['01'])

            if '02' in ROSBoardSocketHandler.button_msg:
                button02 = int(ROSBoardSocketHandler.button_msg['02'])

            if '10' in ROSBoardSocketHandler.button_msg:
                button10 = int(ROSBoardSocketHandler.button_msg['10'])

            if '11' in ROSBoardSocketHandler.button_msg:
                button11 = int(ROSBoardSocketHandler.button_msg['11'])

            if '12' in ROSBoardSocketHandler.button_msg:
                button12 = int(ROSBoardSocketHandler.button_msg['12'])

            if '20' in ROSBoardSocketHandler.button_msg:
                button20 = int(ROSBoardSocketHandler.button_msg['20'])
            
            if '21' in ROSBoardSocketHandler.button_msg:
                button21 = int(ROSBoardSocketHandler.button_msg['21'])
            
            if '22' in ROSBoardSocketHandler.button_msg:
                button22 = int(ROSBoardSocketHandler.button_msg['22'])

            msg.data = [button00, button01, button02, button10, button11, button12, button20, button21, button22]

    def joy_loop(self):
        """
        Sending joy message from client
        """
        twist = Twist()
        while True:
            time.sleep(0.1)
            if not isinstance(ROSBoardSocketHandler.joy_msg, dict):
                continue
            if 'x' in ROSBoardSocketHandler.joy_msg and 'y' in ROSBoardSocketHandler.joy_msg:
                twist.linear.x = -float(ROSBoardSocketHandler.joy_msg['y']) * 3.0
                twist.angular.z = -float(ROSBoardSocketHandler.joy_msg['x']) * 2.0
            self.twist_pub.publish(twist)

    def pingpong_loop(self):
        """
        Loop to send pings to all active sockets every 5 seconds.
        """
        while True:
            time.sleep(5)

            if self.event_loop is None:
                continue
            try:
                self.event_loop.add_callback(ROSBoardSocketHandler.send_pings)
            except Exception as e:
                rospy.logwarn(str(e))
                traceback.print_exc()

    def sync_subs_loop(self):
        """
        Periodically calls self.sync_subs(). Intended to be run in a thread.
        """
        while True:
            time.sleep(1)
            self.sync_subs()

    def sync_subs(self):
        """
        Looks at self.remote_subs and makes sure local subscribers exist to match them.
        Also cleans up unused local subscribers for which there are no remote subs interested in them.
        """

        # Acquire lock since either sync_subs_loop or websocket may call this function (from different threads)
        self.lock.acquire()

        try:
            # all topics and their types as strings e.g. {"/foo": "std_msgs/String", "/bar": "std_msgs/Int32"}
            self.all_topics = {}

            for topic_tuple in rospy.get_published_topics():
                topic_name = topic_tuple[0]
                topic_type = topic_tuple[1]
                if type(topic_type) is list:
                    topic_type = topic_type[0] # ROS2
                self.all_topics[topic_name] = topic_type

            self.event_loop.add_callback(
                ROSBoardSocketHandler.broadcast,
                [ROSBoardSocketHandler.MSG_TOPICS, self.all_topics ]
            )

            for topic_name in self.remote_subs:
                if len(self.remote_subs[topic_name]) == 0:
                    continue

                # remote sub special (non-ros) topic: _dmesg
                # handle it separately here
                if topic_name == "_dmesg":
                    if topic_name not in self.local_subs:
                        rospy.loginfo("Subscribing to dmesg [non-ros]")
                        self.local_subs[topic_name] = DMesgSubscriber(self.on_dmesg)
                    continue

                if topic_name == "_system_stats":
                    if topic_name not in self.local_subs:
                        rospy.loginfo("Subscribing to _system_stats [non-ros]")
                        self.local_subs[topic_name] = SystemStatsSubscriber(self.on_system_stats)
                    continue

                if topic_name == "_top":
                    if topic_name not in self.local_subs:
                        rospy.loginfo("Subscribing to _top [non-ros]")
                        self.local_subs[topic_name] = ProcessesSubscriber(self.on_top)
                    continue

                # check if remote sub request is not actually a ROS topic before proceeding
                if topic_name not in self.all_topics:
                    rospy.logwarn("warning: topic %s not found" % topic_name)
                    continue

                # if the local subscriber doesn't exist for the remote sub, create it
                if topic_name not in self.local_subs:
                    topic_type = self.all_topics[topic_name]
                    msg_class = self.get_msg_class(topic_type)

                    if msg_class is None:
                        # invalid message type or custom message package not source-bashed
                        # put a dummy subscriber in to avoid returning to this again.
                        # user needs to re-run rosboard with the custom message files sourced.
                        self.local_subs[topic_name] = DummySubscriber()
                        self.event_loop.add_callback(
                            ROSBoardSocketHandler.broadcast,
                            [
                                ROSBoardSocketHandler.MSG_MSG,
                                {
                                    "_topic_name": topic_name, # special non-ros topics start with _
                                    "_topic_type": topic_type,
                                    "_error": "Could not load message type '%s'. Are the .msg files for it source-bashed?" % topic_type,
                                },
                            ]
                        )
                        continue

                    self.last_data_times_by_topic[topic_name] = 0.0

                    rospy.loginfo("Subscribing to %s" % topic_name)

                    self.local_subs[topic_name] = rospy.Subscriber(
                        topic_name,
                        self.get_msg_class(topic_type),
                        self.on_ros_msg,
                        callback_args = (topic_name, topic_type),
                    )

            # clean up local subscribers for which remote clients have lost interest
            for topic_name in list(self.local_subs.keys()):
                if topic_name not in self.remote_subs or \
                    len(self.remote_subs[topic_name]) == 0:
                        rospy.loginfo("Unsubscribing from %s" % topic_name)
                        self.local_subs[topic_name].unregister()
                        del(self.local_subs[topic_name])

        except Exception as e:
            rospy.logwarn(str(e))
            traceback.print_exc()

        self.lock.release()

    def on_system_stats(self, system_stats):
        """
        system stats received. send it off to the client as a "fake" ROS message (which could at some point be a real ROS message)
        """
        if self.event_loop is None:
            return

        msg_dict = {
            "_topic_name": "_system_stats", # special non-ros topics start with _
            "_topic_type": "rosboard_msgs/msg/SystemStats",
        }

        for key, value in system_stats.items():
            msg_dict[key] = value

        self.event_loop.add_callback(
            ROSBoardSocketHandler.broadcast,
            [
                ROSBoardSocketHandler.MSG_MSG,
                msg_dict
            ]
        )

    def on_top(self, processes):
        """
        processes list received. send it off to the client as a "fake" ROS message (which could at some point be a real ROS message)
        """
        if self.event_loop is None:
            return

        self.event_loop.add_callback(
            ROSBoardSocketHandler.broadcast,
            [
                ROSBoardSocketHandler.MSG_MSG,
                {
                    "_topic_name": "_top", # special non-ros topics start with _
                    "_topic_type": "rosboard_msgs/msg/ProcessList",
                    "processes": processes,
                },
            ]
        )

    def on_dmesg(self, text):
        """
        dmesg log received. make it look like a rcl_interfaces/msg/Log and send it off
        """
        if self.event_loop is None:
            return

        self.event_loop.add_callback(
            ROSBoardSocketHandler.broadcast,
            [
                ROSBoardSocketHandler.MSG_MSG,
                {
                    "_topic_name": "_dmesg", # special non-ros topics start with _
                    "_topic_type": "rcl_interfaces/msg/Log",
                    "msg": text,
                },
            ]
        )

    def on_ros_msg(self, msg, topic_info):
        """
        ROS messaged received (any topic or type).
        """
        topic_name, topic_type = topic_info
        t = time.time()
        if t - self.last_data_times_by_topic.get(topic_name, 0) < self.update_intervals_by_topic[topic_name] - 1e-4:
            return

        if self.event_loop is None:
            return

        # convert ROS message into a dict and get it ready for serialization
        ros_msg_dict = ros2dict(msg)

        # add metadata
        ros_msg_dict["_topic_name"] = topic_name
        ros_msg_dict["_topic_type"] = topic_type
        ros_msg_dict["_time"] = time.time() * 1000

        # log last time we received data on this topic
        self.last_data_times_by_topic[topic_name] = t

        # broadcast it to the listeners that care
        self.event_loop.add_callback(
            ROSBoardSocketHandler.broadcast,
            [ROSBoardSocketHandler.MSG_MSG, ros_msg_dict]
        )

def main(args=None):
    ROSBoardNode().start()

if __name__ == '__main__':
    main()

