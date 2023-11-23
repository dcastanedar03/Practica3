import express from "npm:express@4.18.2";
import mongoose from "npm:mongoose@7.6.3";
import {CronJob} from "npm:cron@3.1.6";
import { ClienteModel } from "./db/cliente.ts";
import { HipotecaModel } from "./db/hipoteca.ts";
import postCliente from "./resolvers/postCliente.ts";
import putAmortizarHipoteca from "./resolvers/amortizarHipoteca.ts";
import deleteCliente from "./resolvers/deleteCliente.ts";
import getCliente from "./resolvers/getCLiente.ts";
import getHipoteca from "./resolvers/getHipoteca.ts";
import enviar from "./resolvers/enviar.ts";
import ingresar from "./resolvers/ingresar.ts";
import postHipoteca from "./resolvers/postHipoteca.ts";
import postGestor from "./resolvers/postGestor.ts";
import asignarGestores from "./resolvers/asignarGestores.ts";
import getGestor from "./resolvers/getGestor.ts";
import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";

const env = await load();

const MONGO_URL = env.MONGO_URL || Deno.env.get("MONGO_URL")

if(!MONGO_URL){
    console.log("No mongo URL found");
    Deno.exit(1);
}

await mongoose.connect(MONGO_URL);

const app = express();
app.use(express.json());
app
  .post("/Cliente", postCliente)
  .post("/Hipoteca", postHipoteca)
  .post("/Gestor", postGestor)

  .delete("/Cliente/:DNI", deleteCliente)

  .put("/enviarDinero", enviar)
  .put("/ingresarDinero", ingresar)
  .put("/Gestor/:DNI", asignarGestores)
  .put("/Hipoteca", putAmortizarHipoteca)

  .get("/Cliente", getCliente)
  .get("/Gestor", getGestor)
  .get("/Hipoteca", getHipoteca)

  const response = () => ({
    status: (code: number) => ({ send: (data: string) => console.log(`Status ${code}: ${data}`) }),
  });

  const cronJob = new CronJob('*/5 * * * *', async () => {
    try {
      const clientes = await ClienteModel.find({});
      if(clientes.length == 0){
        console.log("There are no clients");
        return;
      }
      for (const cliente of clientes) { 
        cliente.dinero += 10000;
        await cliente.save();
      }
        const hipoteca = await HipotecaModel.find({})
        for(let i = 0; i < clientes.length; i++){
          for(let j = 0; j < hipoteca.length; j++){
            for(let k = 0; k < hipoteca[j].clientes.length; k++){       
              if(clientes[i].id == hipoteca[j].clientes[k]){
                await putAmortizarHipoteca({body: {DNIcliente: clientes[i].DNI.toString(), idHipoteca: hipoteca[j].id.toString(),  amortizar: Number(hipoteca[j].cuotas[0])}}, response())
              }
            }
          }
        }
      console.log("10,000 euros have been deposited to all clients");
    } catch (error) {
      console.log("Error", error);
    }
  });
  
  cronJob.start(); 

app.listen(3002);
