import Chat from "../Models/chat.model.js";
//algorithm for chatting system

//1. as user open the app then connect the socket connection from client to server and listen - backend part done

//2. show the online, offline or last seen status to the all client of all users - backend part done

//3. send message to the receiver - backend part done
//3.1 as message reached to the server, save it to the database
//3.2 check whether the receiver is online or not
//3.3 if online then send message and save the status to database and also update to the sender : delivered status

//4 check if receiver read or seen the message then update the sender about it - backend part done

const onlineUsers = new Map();
const lastSeen = new Map();
const HandleChat = (socket, io) => {
  onlineUsers.set(socket.user._id, socket.id);
  lastSeen.delete(socket.user._id);

  // const Online = Array.from(onlineUsers.keys());
  // const offlineAndLastSeen = Array.from(lastSeen.entries());

  const Online = Array.from(onlineUsers.keys());
    const offlineAndLastSeen = Object.fromEntries(lastSeen);

  io.emit("users_status_update", { Online, offlineAndLastSeen });

  //send undelivered message

  const SendUndeliveredMessage = async () => {
    try {
      const UndeliveredMsg = await Chat.find({
        receiver: socket.user._id,
        MessageStatus: "sent",
      });

      if (UndeliveredMsg.length) {
        for (const message of UndeliveredMsg) {
          io.to(socket.id).emit("send_message", message);
          message.MessageStatus = "delivered";
          await message.save();
        }
        socket.emit(
          "deliveredmsg",
          "all undeliverd message has been delivered"
        );
      }
    } catch (error) {
      console.error("Error sending undelivered messages:", error);
    }
  };

  SendUndeliveredMessage();

  socket.on("send_message", async (SendMessage) => {
    console.log(`message sent from client - send_message is ${SendMessage}`);

    const {
      receiver,
      sender,
      MessageType,
      MessageFileUrl,
      MessageStatus,
      TimeStamps,
    } = SendMessage;

    try {
      const MessageDb = await Chat.create({
        receiver,
        sender,
        MessageType,
        MessageFileUrl,
        MessageStatus,
        TimeStamps,
      });

      if (MessageDb) {
        const receiversocket = Array.from(io.sockets.sockets.values()).find(
          (socket) => socket.user._id === receiver
        );

        if (receiversocket) {
          io.to(receiversocket.id).emit("send_message", SendMessage);
          console.log(
            "receiver socket id is",
            receiversocket.id,
            "and receiver socket user id is",
            receiversocket.user._id
          );
          MessageDb.MessageStatus = "delivered";
          await MessageDb.save();
          socket.emit("deliveredmsg", "message has been delivered");
        }
      }
    } catch (error) {
      console.error("Error in send_message handler:", error);
    }
  });
  socket.on("read_message", (read) => {
    socket.emit("readMessage", read);
  });

  socket.on("disconnect", () => {
    lastSeen.set(socket.user._id, Date.now());
    onlineUsers.delete(socket.user._id);
    const Online = Array.from(onlineUsers.keys());
    const offlineAndLastSeen = Object.fromEntries(lastSeen);

    io.emit("users_status_update", { Online, offlineAndLastSeen });

  });
};

export { HandleChat };
