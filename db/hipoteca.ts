import mongoose from "npm:mongoose@7.6.3";
import { Hipoteca } from "../type.ts";

const schema = mongoose.Schema;
const HipotecaSchema = new schema(
    {
        clientes: [{type:schema.Types.ObjectId, ref: "Cliente", required: true}],
        gestores: [{type: schema.Types.ObjectId, ref: "Gestor", required: true}],
        cuotas: [{type: Array<number>, required: true}],
        total: {type: Number, required: true, default: 0},
    },
    {timestamps: false}
);
HipotecaSchema.path("cuotas").validate((cuotas: number[]) => {
    if(cuotas.length != 20) return false
    return true;
})
HipotecaSchema.path("total").validate((total: number) => {
    if(total > 1000000) return false
    return true;
})
export type HipotecaModelType = mongoose.Document & Omit<Hipoteca, "id" | "clientes" | "gestores"> & {
    clientes: mongoose.Types.ObjectId[];
    gestores: mongoose.Types.ObjectId[];
};
export const HipotecaModel = mongoose.model<HipotecaModelType>("Hipoteca", HipotecaSchema);