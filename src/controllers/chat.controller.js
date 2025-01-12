import Chat from "../Models/chat.model.js";
const HandleChat = (socket, io) => {
  socket.on("send_message", async (SendMessage) => {
    console.log(`message sent from client - send_message is ${SendMessage}`);

    const {
      receiver,
      sender,
      MessageType,
      MessageText,
      MessageStatus,
      TimeStamps,
    } = SendMessage;

    const MessageDb = await Chat.create({
      receiver,
      sender,
      MessageType,
      MessageText,
      MessageStatus,
      TimeStamps,
    });

    if (MessageDb) {
      const receiversocket = Array.from(io.sockets.sockets.value()).find(
        (socket) => socket.user._id === receiver
      );

      if (receiversocket) {
        io.to(receiversocket.id).emit("send_message", SendMessage);
        (MessageDb.MessageStatus = "delivered"), await MessageDb.save();
        socket.emit("deliveredmsg", "message has been delivered");
      }
    }

    socket.on("read_message", (read) => {
      socket.emit("readMessage", read);
    });
  });
};

export { HandleChat };
