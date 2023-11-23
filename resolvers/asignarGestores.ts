import {Request, Response} from "npm:express@4.18.2";
import {ClienteModel} from "../db/cliente.ts";
import { Gestor } from "../type.ts";
import { Cliente } from "../type.ts";
import {GestorModel} from "../db/gestor.ts";
import { getClienteFromModel } from "../controllers/getClientModel.ts";
import { getGestorFromModel } from "../controllers/getGestorModel.ts";

const asignarGestores = async (req:Request, res: Response)  => {
    try{
        const {DNI} = req.params;
        const {DNICliente} = req.body;     
        if(!DNICliente){
            res.status(500).send("Client DNI is required");
            return;
        }   
        const existe = await GestorModel.findOne({DNI: DNI})
        if(!existe){
            res.status(500).send("Gestor is not found");
            return;
        }
        const gestorResponse: Gestor = await getGestorFromModel(existe)

        if(gestorResponse.clientes && gestorResponse.clientes.length >= 10){
            res.status(500).send("Gestor has enough clients");
            return;
        }else if(gestorResponse.clientes && gestorResponse.clientes.find(elem => {elem.DNI == DNICliente})){
            res.status(500).send("This Gestor alredy has this client");
            return;
        }
        let hayCliente = await ClienteModel.findOne({DNI: DNICliente})
        if(!hayCliente){
            res.status(500).send("Client not found");
            return;
        }
        hayCliente = await ClienteModel.findOneAndUpdate({DNI: DNICliente}, 
                                {gestor: existe},
                                {new: true});
        
        if(!hayCliente){
            res.status(500).send("Client can't be update");
            return;
        }
        const clienteResponse: Cliente = await getClienteFromModel(hayCliente)
        res.status(200).send(clienteResponse);
    }catch(error){
        res.status(500).send(error.message)
    }
}

export default asignarGestores;