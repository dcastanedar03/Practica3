import {Request, Response} from "npm:express@4.18.2";
import { HipotecaModel } from "../db/hipoteca.ts";
import { ClienteModel } from "../db/cliente.ts";

const putAmortizarHipoteca = async (req:Request, res: Response)  => {
    try{
        const {DNIcliente, idHipoteca, amortizar} = req.body;
        if(!amortizar || !DNIcliente || !idHipoteca){
            res.status(500).send("Money or not DNI or Hipoteca id");
            return;
        }
        let existeHipoteca = await HipotecaModel.findById(idHipoteca)
        if(!existeHipoteca){
            res.status(500).send("Hipoteca not found");
            return;
        }
        let cliente = await ClienteModel.findOne({DNI: DNIcliente})
        if(!cliente || cliente.dinero < amortizar){
            res.status(500).send("Client not found or not have enough money");
            return;
        }else if(existeHipoteca.cuotas.length == 0){
            res.status(500).send("No cuotas to pay")
            return
        }else if(existeHipoteca.cuotas[0]!= amortizar){
            res.status(500).send("The money is not the same")
            return
        }
        cliente = await ClienteModel.findOneAndUpdate({DNI: DNIcliente}, 
                                {$inc: {dinero: amortizar*-1}},
                                {new: true});
        existeHipoteca.cuotas.shift();
        existeHipoteca = await HipotecaModel.findByIdAndUpdate(idHipoteca, {
            cuotas: existeHipoteca.cuotas,
            total: existeHipoteca.total - amortizar
        })
        res.status(200).send("transaction carried out") ;
    }catch(error){
        res.status(500).send(error.message)
    }
}

export default putAmortizarHipoteca;