import Chat from "../Models/chat.model.js";

const HandleChat = (socket, io) => {
  socket.on("send_message", async (SendMessage) => {
    console.log(`Message sent from client: ${JSON.stringify(SendMessage)}`);

    const {
      receiver,
      sender,
      MessageType,
      MessageText,
      MessageStatus,
      TimeStamps,
    } = SendMessage;

    try {
      const MessageDb = await Chat.create({
        receiver,
        sender,
        MessageType,
        MessageText,
        MessageStatus,
        TimeStamps,
      });

      if (MessageDb) {
        const receiversocket = Array.from(io.sockets.sockets.values()).find(
          (s) => s.user && s.user._id === receiver
        );

        if (receiversocket) {
            io.to(receiversocket.id).emit("send_message", SendMessage);
          MessageDb.MessageStatus = "delivered";
          await MessageDb.save();
          socket.emit("deliveredmsg", "Message has been delivered");
        }
      }
    } catch (error) {
      console.error("Error in send_message handler:", error);
    }
  });

  socket.on("read_message", (read) => {
    socket.emit("readMessage", read);
  });
};

export { HandleChat };
