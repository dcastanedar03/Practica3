import { ClienteModelType } from "../db/cliente.ts";
import { Cliente } from "../type.ts";
import { HipotecaModel } from "../db/hipoteca.ts";
import { GestorModel } from "../db/gestor.ts";


export const getClienteFromModel = async (
  subject: ClienteModelType
): Promise<Cliente> => {
  const { name, DNI, dinero, gestor, _id} = subject;
  let gest = undefined;
  if(gestor){
      gest = await GestorModel.findById(gestor);
      if (!gest) throw new Error("Client not found");
  }

  const hipotec = await HipotecaModel.find({clientes: { $in: _id } });
  return {
    id: _id.toString(),
    name,
    DNI,
    dinero,
    gestor: gest && {
      id: gest._id.toString(),
      name: gest.name,
      DNI: gest.DNI,
    },
    hipotecas: hipotec.map((hipoteca) => ({
      id: hipoteca._id.toString(),
      cuotas: hipoteca.cuotas.map((elem: any) => elem[0]),
      cuotasporpagar: hipoteca.cuotas.length,
      total: hipoteca.total
    })),
  };
};