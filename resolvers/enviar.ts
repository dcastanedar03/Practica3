import {Request, Response} from "npm:express@4.18.2";
import { ClienteModel } from "../db/cliente.ts";

const enviar = async(req:Request<{envia:string, recive:string, cantidad:number}>, res:Response<string | {error:unknown}>) => {
    try{
        const {envia, recive, cantidad} = req.body;
        const clienteOrigen = await ClienteModel.findById(envia).exec();
        const clienteDestino = await ClienteModel.findById(recive).exec();
        if(!clienteOrigen){
            res.status(404).send("The origin client does not exist");
            return;
        }
        if(!clienteDestino){
            res.status(404).send("The target client does not exist");
            return;
        }
        if(clienteOrigen.dinero < cantidad){
            res.status(400).send("He doesn't have enough money");
            return;
        }
        clienteOrigen.dinero -= cantidad;
        clienteDestino.dinero += cantidad;
        await clienteOrigen.save();
        await clienteDestino.save();
        res.status(200).send("Money sent successfully");
    }catch(error){
        res.status(500).send(error.message);
        return;
    }
}

export default enviar;