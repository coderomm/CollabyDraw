// "use server";

// import { z } from "zod";
// import client from "@repo/db/client";
// import { JoinRoomSchema } from "@repo/common/types";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/utils/auth";
// import { Shape } from "@/types/canvas";

// export async function getShapes(data: { roomName: string }) {
//   try {
//     const validatedRoomName = JoinRoomSchema.parse(data);

//     const room = await client.room.findUnique({
//       where: { slug: validatedRoomName.roomName },
//     });

//     if (!room || !room.id) {
//       return { success: false, error: "Room not found" };
//     }

//     const shapesResponse = await client.shape.findMany({
//       where: { roomId: room.id },
//     });

//     if (!shapesResponse.length) {
//       return { success: true, shapes: [] };
//     }

//     const shapes: Shape[] = shapesResponse.map((x) => JSON.parse(x.message));

//     return { success: true, shapes };
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return { success: false, error: "Invalid room code format" };
//     }
//     console.error("Failed to get shapes:", error);
//     return { success: false, error: "Failed to get shapes" };
//   }
// }

// export async function clearAllShapes(data: { roomName: string }) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user || !session.user.email) {
//       return { success: false, error: "Authentication required" };
//     }

//     const userEmail = session.user.email;
//     const validatedRoomName = JoinRoomSchema.parse(data);

//     const room = await client.room.findUnique({
//       where: { slug: validatedRoomName.roomName },
//       include: { admin: true },
//     });

//     if (!room || !room.id) {
//       return { success: false, error: "Room not found" };
//     }

//     if (room.admin.email !== userEmail) {
//       return {
//         success: false,
//         error: "Unauthorized: Only the room creator can clear chats",
//       };
//     }

//     const result = await client.shape.deleteMany({
//       where: { roomId: room.id },
//     });

//     return {
//       success: true,
//       count: result.count,
//     };
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return { success: false, error: "Invalid room code format" };
//     }
//     console.error("Failed to clear shapes:", error);
//     return { success: false, error: "Failed to clear shapes" };
//   }
// }
