// Importa o framework Express para criar o servidor HTTP
import express, { type Express } from "express";
// Importa o módulo 'fs' do Node.js para manipulação de arquivos
import fs from "fs";
// Importa o módulo 'path' para lidar com caminhos de arquivos e diretórios
import path from "path";
// Importa funções do Vite para criar um servidor e gerenciar logs
import { createServer as createViteServer, createLogger } from "vite";
// Importa o tipo Server do módulo 'http' (para tipagem)
import { type Server } from "http";
// Importa a configuração do Vite definida em outro arquivo
import viteConfig from "../vite.config";
// Importa o nanoid (gera identificadores únicos curtos)
import { nanoid } from "nanoid";

// Cria um logger padrão do Vite (para logs de desenvolvimento)
const viteLogger = createLogger();

/**
 * Função auxiliar para exibir logs no console com horário formatado.
 * @param message - mensagem a ser exibida no log
 * @param source - origem do log (padrão: "express")
 */
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * Função que configura o servidor Vite dentro do Express em modo de desenvolvimento.
 * Ela integra o Vite como middleware, permitindo hot reload e processamento de HTML.
 */
export async function setupVite(app: Express, server: Server) {
  // Configurações do servidor Vite
  const serverOptions = {
    middlewareMode: true, // usa o Vite como middleware, sem iniciar um servidor próprio
    hmr: { server }, // ativa Hot Module Replacement (atualização em tempo real)
    allowedHosts: true as const, // permite todas as origens (útil para Replit, por exemplo)
  };

  // Cria o servidor Vite com base na configuração existente
  const vite = await createViteServer({
    ...viteConfig, // usa a configuração do vite.config.js
    configFile: false, // evita recarregar o arquivo de config
    customLogger: {
      ...viteLogger, // utiliza o logger padrão do Vite
      error: (msg, options) => {
        // em caso de erro crítico, loga e encerra o processo
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions, // aplica as opções do servidor
    appType: "custom", // indica que o servidor Express vai controlar o app
  });

  // Adiciona os middlewares do Vite (para processar JS, CSS, etc.)
  app.use(vite.middlewares);

  // Rota genérica para qualquer caminho ("*")
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl; // obtém a URL requisitada

    try {
      // Caminho para o arquivo HTML principal do cliente
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // Lê o arquivo index.html diretamente do disco (para garantir sempre a versão mais recente)
      let template = await fs.promises.readFile(clientTemplate, "utf-8");

      // Adiciona um ID único ao import do main.tsx (força o navegador a recarregar o arquivo atualizado)
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );

      // Deixa o Vite processar o HTML (para injetar scripts e módulos)
      const page = await vite.transformIndexH
