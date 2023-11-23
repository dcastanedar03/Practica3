import {Request, Response} from "npm:express@4.18.2";
import { ClienteModel } from "../db/cliente.ts";

const ingresar = async(req:Request<{id:string, cantidad:number}>, res:Response<string | {error:unknown}>) => {
    try{
        const {idCLiente, cantidad} = req.body;
        const cliente = await ClienteModel.findById(idCLiente).exec();
        if(!cliente){
            res.status(404).send("Client could not be found ");
            return;
        }
        cliente.dinero += Number(cantidad);
        await cliente.save();
        res.status(200).send("Money entered correctly");
    }catch(error){
        res.status(500).send(error.message);
        return;
    }
}

export default ingresar;