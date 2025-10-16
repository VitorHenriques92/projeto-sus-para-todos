// Importa a conexão com o banco de dados configurada no arquivo "db.ts"
import { db } from "./db";

// Importa os tipos e tabelas definidas no schema compartilhado
import {
  type Hospital,
  type InsertHospital,
  type Specialty,
  type InsertSpecialty,
  type Appointment,
  type InsertAppointment,
  type News,
  type InsertNews,
  type User,
  type InsertUser,
  hospitals,
  specialties,
  appointments,
  news,
  users,
} from "@shared/schema";

// Importa funções auxiliares do Drizzle ORM para construir consultas SQL
import { eq, and, gte, sql } from "drizzle-orm";


// 🔹 Interface que define as operações que o armazenamento (banco) precisa oferecer.
// Isso serve como contrato: qualquer classe que implemente `IStorage` precisa ter esses métodos.
export interface IStorage {
  // --- HOSPITAIS ---
  getHospitals(): Promise<Hospital[]>; // Retorna todos os hospitais
  getHospital(id: string): Promise<Hospital | undefined>; // Busca hospital por ID
  createHospital(hospital: InsertHospital): Promise<Hospital>; // Cria novo hospital

  // --- ESPECIALIDADES ---
  getSpecialties(): Promise<Specialty[]>; // Retorna todas as especialidades
  getSpecialty(id: string): Promise<Specialty | undefined>; // Busca especialidade por ID
  createSpecialty(specialty: InsertSpecialty): Promise<Specialty>; // Cria nova especialidade
  updateSpecialtyImage(id: string, imageUrl: string): Promise<void>; // Atualiza imagem da especialidade

  // --- CONSULTAS / AGENDAMENTOS ---
  getAppointments(userId: string): Promise<Appointment[]>; // Retorna todas as consultas de um usuário
  getAppointment(id: string, userId: string): Promise<Appointment | undefined>; // Busca consulta específica
  getAppointmentsByDate(date: Date, userId: string): Promise<Appointment[]>; // Filtra consultas por data
  createAppointment(appointment: InsertAppointment, userId: string): Promise<Appointment>; // Cria nova consulta
  updateAppointment(id: string, appointment: Partial<InsertAppointment>, userId: string): Promise<Appointment>; // Atualiza uma consulta
  deleteAppointment(id: string, userId: string): Promise<void>; // Exclui uma consulta

  // --- NOTÍCIAS ---
  getNews(): Promise<News[]>; // Retorna todas as notícias (ordenadas por data)
  getNewsItem(id: string): Promise<News | undefined>; // Busca notícia específica
  createNews(newsItem: InsertNews): Promise<News>; // Cria nova notícia
  updateNewsImage(id: string, imageUrl: string): Promise<void>; // Atualiza imagem da notícia

  // --- USUÁRIOS ---
  createUser(user: InsertUser): Promise<User>; // Cria novo usuário
  getUserByEmail(email: string): Promise<User | undefined>; // Busca usuário por email
  getUserById(id: string): Promise<User | undefined>; // Busca usuário por ID
  updateUserPassword(id: string, passwordHash: string): Promise<void>; // Atualiza senha
  updateUserProfile(id: string, data: { email?: string; phone?: string }): Promise<User>; // Atualiza perfil (email/telefone)
}


// 🔹 Implementação concreta da interface IStorage, utilizando o Drizzle ORM
export class DatabaseStorage implements IStorage {

  // --- HOSPITAIS ---

  // Retorna todos os hospitais cadastrados
  async getHospitals(): Promise<Hospital[]> {
    return await db.select().from(hospitals);
  }

  // Retorna um hospital específico pelo ID
  async getHospital(id: string): Promise<Hospital | undefined> {
    const result = await db.select().from(hospitals).where(eq(hospitals.id, id));
    return result[0];
  }

  // Cria um novo hospital no banco
  async createHospital(hospital: InsertHospital): Promise<Hospital> {
    const result = await db.insert(hospitals).values(hospital).returning();
    return result[0];
  }

  // --- ESPECIALIDADES ---

  // Retorna todas as especialidades cadastradas
  async getSpecialties(): Promise<Specialty[]> {
    return await db.select().from(specialties);
  }

  // Retorna uma especialidade específ
