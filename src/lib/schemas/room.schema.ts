import { z } from "zod";
import {RoomType} from "../../domain/room/roomType.enum";
import { topics } from "../../db";

export const createRoomSchema = z.object({
    admin: z.string(),
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(30, "El nombre debe tener hasta de 30 caracteres"),
    privacy: z.enum(RoomType),
    password: z.string().optional(),
    discussionTime: z.number().min(10, "Debe ser mayor a 10 segundos"),
    voteTime: z.number().min(10, "Debe ser mayor a 10 segundos"),
    moveTime: z.number().min(10, "Debe ser mayor a 30 segundos"),
    maxPlayers: z.number().min(2, "Debe permitir al menos 2 jugadores"),
    topic: z.enum(topics).optional(),
    randomTopic: z.boolean(),
}).refine(
    (data) =>
        data.privacy === RoomType.PUBLIC || (data.privacy === RoomType.PRIVATE && data.password?.length),
    {
        message: "La password es obligatoria para rooms privados",
        path: ["password"],
    }
)
.superRefine((data, ctx) => {
    if (!data.randomTopic && !data.topic) {
        ctx.addIssue({
            path: ["topic"],
            message: "Debe seleccionar una categoría o activar Random",
            code: "custom", // ← forma actual recomendada
        })
    }
});
