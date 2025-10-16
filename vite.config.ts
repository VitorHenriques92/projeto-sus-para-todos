// Importa a função defineConfig do Vite para configurar o projeto
import { defineConfig } from "vite";
// Importa o plugin do React para permitir uso do JSX e recursos do React
import react from "@vitejs/plugin-react";
// Importa o módulo 'path' do Node.js para lidar com caminhos de arquivos
import path from "path";
// Importa o plugin que mostra erros de runtime como modais na tela (usado no Replit)
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Exporta a configuração do Vite
export default defineConfig({
  plugins: [
    // Adiciona suporte ao React
    react(),

    // Adiciona o overlay de erros em tempo de execução (modal de erro)
    runtimeErrorOverlay(),

    // Se o ambiente não for produção e estiver rodando no Replit,
    // adiciona dois plugins extras: o "cartographer" e o "dev-banner"
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          // Plugin "cartographer" — usado pelo Replit para mapear arquivos/projetos
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),

          // Plugin "devBanner" — exibe um banner de desenvolvimento no Replit
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],

  // Configura aliases para facilitar importações dentro do projeto
  resolve: {
    alias: {
      // "@" aponta para o diretório "client/src"
      "@": path.resolve(import.meta.dirname, "client", "src"),
      // "@shared" aponta para o diretório "shared"
      "@shared": path.resolve(import.meta.dirname, "shared"),
      // "@assets" aponta para o diretório "attached_assets"
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },

  // Define o diretório raiz do projeto como "client"
  root: path.resolve(import.meta.dirname, "client"),

  // Configurações de build (empacotamento)
  build: {
    // Define onde os arquivos compilados serão salvos
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    // Garante que a pasta de saída será limpa antes do novo build
    emptyOutDir: true,
  },

  // Configurações do servidor de desenvolvimento (Vite dev server)
  server: {
    fs: {
      // Impede o acesso fora do diretório raiz do projeto
      strict: true,
      // Bloqueia acesso a arquivos ocultos (como .env, .git, etc.)
      deny: ["**/.*"],
    },
  },
});
