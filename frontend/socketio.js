// Connect to socket.io server
const socket = io.connect("http://localhost:3000");

// Listen for "event" event
socket.on("event", msg => {
    console.log("event:", msg);
});

// Send a custom "event" event
document.getElementById("send").addEventListener("click", () => {
    const msg = document.getElementById("input").value;
    socket.emit("event", msg);
});