import { GestorModelType } from "../db/gestor.ts";
import { ClienteModel } from "../db/cliente.ts";
import { Gestor } from "../type.ts";
import { HipotecaModel } from "../db/hipoteca.ts";

export const getGestorFromModel = async (
  subject: GestorModelType
): Promise<Gestor> => {

  const {name, DNI, _id} = subject;
  const clientes = await ClienteModel.find({gestor: _id });
  const hipotec = await HipotecaModel.find({gestores: { $in: _id } });

  return {
    id: _id.toString(),
    name,
    DNI,
    clientes: clientes.map((client) => ({
      id: client._id.toString(),
      name: client.name,
      DNI: client.DNI,
      dinero: client.dinero
    })),
    hipotecas: hipotec.map((hipoteca) => ({
      id: hipoteca._id.toString(),
      cuotas: hipoteca.cuotas.map((elem: any) => elem[0]),
      cuotasporpagar: hipoteca.cuotas.length,
      total: hipoteca.total
    })),
  };
};