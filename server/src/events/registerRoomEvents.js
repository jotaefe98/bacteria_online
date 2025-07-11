"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoomEvents = registerRoomEvents;
const const_1 = require("../const/const");
function registerRoomEvents(io, socket, rooms) {
    socket.on("join-room", (data) => {
        console.log("Data recieved in join-room: ", data);
        const { roomId, playerId, nickname } = data;
        socket.join(roomId);
        console.log(rooms);
        const existingPlayer = rooms[roomId].players.find((p) => p.playerId === playerId);
        if (existingPlayer) {
            // Player is reconnecting - update their socket ID and potentially disconnect old connection
            if (existingPlayer.socketId !== socket.id) {
                console.log(`Player ${playerId} reconnecting - updating socket ID from ${existingPlayer.socketId} to ${socket.id}`);
                io.to(existingPlayer.socketId).emit("force-disconnect");
                existingPlayer.socketId = socket.id;
                // Update nickname if provided
                if (nickname) {
                    existingPlayer.nickname = nickname;
                }
                // If game has started, send current game state
                const gameRoom = rooms[roomId];
                if (gameRoom.has_started && gameRoom.hands && gameRoom.boards) {
                    console.log(`Sending game state to reconnecting player ${playerId}`);
                    setTimeout(() => {
                        socket.emit("deck-shuffled", {
                            hands: gameRoom.hands,
                            boards: gameRoom.boards,
                            currentTurn: gameRoom.currentTurn,
                            currentPhase: gameRoom.currentPhase,
                            playerIdList: gameRoom.players.map((p) => p.playerId),
                            discardPile: gameRoom.discardPile,
                            playerNames: gameRoom.playerNames,
                        });
                    }, 500);
                }
            }
        }
        else {
            const isFirstPlayer = rooms[roomId].players.length === 0;
            rooms[roomId].players.push({
                playerId,
                nickname,
                socketId: socket.id,
                isHost: isFirstPlayer,
            });
        }
        // If a user joins in a room, then it is not new anymore
        if (rooms[roomId].new_room)
            rooms[roomId].new_room = false;
        playersUpdate(roomId);
        const roomSettings = {
            min_players: const_1.MIN_NUM_PLAYERS,
            max_players: const_1.MAX_NUM_PLAYERS,
        };
        socket.emit("room-settings", roomSettings);
        console.log(`Player ${nickname} joined room ${roomId}`);
        console.log("Current rooms:", rooms);
    });
    socket.on("update-nickname", (data) => {
        var _a;
        const { roomId, nickname } = data;
        // Find the player in the room
        const player = (_a = rooms[roomId]) === null || _a === void 0 ? void 0 : _a.players.find((p) => p.socketId === socket.id);
        if (player) {
            player.nickname = nickname;
            console.log(`Player ${player.playerId} updated nickname to ${nickname}`);
            playersUpdate(roomId);
        }
        else {
            console.error(`Player not found in room ${roomId}`);
        }
    });
    socket.on("create-room", (roomId) => {
        if (!rooms[roomId])
            rooms[roomId] = { players: [], has_started: false, new_room: true };
        console.log(`Room created with ID: ${roomId}`);
        console.log("Current rooms:", rooms);
        socket.emit("room-created", roomId);
    });
    socket.on("existing-room", (roomId, playerId) => {
        var _a;
        console.log(`Checking if room ${roomId} exists`);
        console.log("Current rooms:", rooms);
        const existingRoom = rooms[roomId];
        const roomIsFull = ((_a = existingRoom === null || existingRoom === void 0 ? void 0 : existingRoom.players) === null || _a === void 0 ? void 0 : _a.length) >= const_1.MAX_NUM_PLAYERS;
        const roomIsStarted = existingRoom === null || existingRoom === void 0 ? void 0 : existingRoom.has_started;
        const isPlayerInRoom = existingRoom === null || existingRoom === void 0 ? void 0 : existingRoom.players.some((p) => p.playerId === playerId);
        // If the player is reconnecting to a game in progress, mark this as a reconnection
        const isReconnecting = roomIsStarted && isPlayerInRoom;
        socket.emit("existing-room", !!existingRoom, roomId, roomIsStarted, roomIsFull, isPlayerInRoom, isReconnecting);
    });
    socket.on("leave-room", ({ roomId }) => {
        var _a, _b;
        console.log(`Player ${socket.id} is leaving room ${roomId}`);
        if (!((_a = rooms[roomId]) === null || _a === void 0 ? void 0 : _a.has_started) && rooms[roomId]) {
            console.log("roomId", roomId);
            console.log("rooms", rooms);
            const before = rooms[roomId].players.length;
            // Check if the player who left was the host
            const wasHost = (_b = rooms[roomId].players.find((p) => p.socketId === socket.id)) === null || _b === void 0 ? void 0 : _b.isHost;
            rooms[roomId].players = rooms[roomId].players.filter((p) => p.socketId !== socket.id);
            // If the player who left was the host, assign host to the first player in the array
            if (wasHost && rooms[roomId].players.length > 0) {
                rooms[roomId].players[0].isHost = true;
            }
            const playersLength = rooms[roomId].players.length;
            if (playersLength !== before) {
                playersUpdate(roomId);
            }
        }
        if (rooms[roomId] &&
            rooms[roomId].players.length === 0 &&
            !rooms[roomId].new_room) {
            // If the room is empty, it was not a new room, delete it
            delete rooms[roomId];
        }
        console.log("A user disconnected:", socket.id);
        console.log("room", JSON.stringify(rooms, null, 2));
    });
    /**
     * Emits an updated list of player nicknames to all clients in the specified room.
     *
     * @param roomId The ID of the room whose player list should be updated.
     */
    function playersUpdate(roomId) {
        const players = rooms[roomId].players.map((p) => ({
            nickname: p.nickname,
            isHost: !!p.isHost,
            playerId: p.playerId,
        }));
        io.to(roomId).emit("players-update", players);
    }
}
