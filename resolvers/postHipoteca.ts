import {Request, Response} from "npm:express@4.18.2";
import { HipotecaModel } from "../db/hipoteca.ts";
import { ClienteModel } from "../db/cliente.ts";
import { GestorModel } from "../db/gestor.ts";
import { Hipoteca } from "../type.ts";
import { getHipotecaFromModel } from "../controllers/getHipotecaModel.ts";

const postHipoteca = async (req:Request, res: Response)  => {
    try{
        const {cuotas, clientes, gestores} = req.body;

        if(!cuotas ||  !clientes || !gestores || clientes.length == 0 || gestores.length == 0){
                res.status(500).send("Cuotas or clientes or gestores are required");
                return;
        }
        const total = cuotas.reduce((e1: number, e2: number) => {
            return e1 + e2
        }, 0)
        const idClientes = []
        const idGestores = []
        for (const cliente of clientes) {
            const t = await ClienteModel.findOne({ DNI: cliente });
            if (t) {
                idClientes.push(t._id);
            } else {
              res.status(500).send("Some of the clients DNI is not correct");
              return;
            }
          }

        for(const gestor of gestores){
            const t = await GestorModel.findOne({DNI: gestor});
            if(t){
                idGestores.push(t._id);
            }else{
                res.status(500).send("Some of the managers DNI is not correct");
                return;
            }
        }
        const newHipoteca = new HipotecaModel({cuotas, clientes: idClientes, gestores: idGestores, total});
        await newHipoteca.save();
        const hipotecaResponse: Hipoteca = await getHipotecaFromModel(newHipoteca)
        res.status(200).send(hipotecaResponse)

    }catch(error){
        res.status(500).send(error.message);
        return
    }
}

export default postHipoteca;