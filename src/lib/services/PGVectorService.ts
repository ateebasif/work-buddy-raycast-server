import {
  PGVectorStore,
  DistanceStrategy,
} from "@langchain/community/vectorstores/pgvector";
import { PoolConfig, Client } from "pg";
import { v4 as uuidv4 } from "uuid";
import type { Document } from "@langchain/core/documents";
import { OllamaEmbeddings } from "@langchain/ollama";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Sample config
const config = {
  postgresConnectionOptions: {
    type: "postgres",
    host: "127.0.0.1",
    port: 5431,
    user: "myuser",
    password: "ChangeMe",
    database: "api",
  } as PoolConfig,
  tableName: "documents",
  columns: {
    idColumnName: "id",
    vectorColumnName: "vector",
    contentColumnName: "content",
    metadataColumnName: "metadata",
  },
  distanceStrategy: "cosine" as DistanceStrategy,
};

const embeddings = new OllamaEmbeddings({ model: "nomic-embed-text" });

export class PGVectorService {
  private vectorStore: PGVectorStore;
  private client: Client;

  constructor() {
    this.client = new Client(config.postgresConnectionOptions);
    this.vectorStore = new PGVectorStore(embeddings, config);
  }

  async connect() {
    await this.client.connect();
    console.log("Connected to PostgreSQL database.");
  }

  async disconnect() {
    await this.client.end();
    console.log("Disconnected from PostgreSQL database.");
  }

  async createTable() {
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id bigserial PRIMARY KEY,
        vector vector(768),  -- Adjust the dimension as needed
        content text,
        metadata jsonb
      );
    `);
    console.log("Table created successfully.");
  }

  async insertDocuments(documents: Document[]) {
    const ids = documents.map(() => uuidv4());
    await this.vectorStore.addDocuments(documents, { ids });
    console.log("Documents inserted successfully.");
  }

  async similaritySearch(query: string, limit: number) {
    const results = await this.vectorStore.similaritySearch(query, limit);
    return results;
  }

  async deleteDocumentById(id: string) {
    await this.client.query(`DELETE FROM documents WHERE id = $1`, [id]);
    console.log(`Document with ID ${id} deleted successfully.`);
  }

  async dropTable() {
    await this.client.query(`DROP TABLE IF EXISTS documents;`);
    console.log("Table dropped successfully.");
  }

  async listDocuments() {
    const res = await this.client.query(`SELECT * FROM documents;`);
    return res.rows; // Return the rows from the query result
  }

  async deleteDocumentsByMetadata(fileName: string, source: string) {
    const query = `
      DELETE FROM documents 
      WHERE metadata->>'fileName' = $1 OR metadata->>'source' = $2
    `;
    const values = [fileName, source];
    const result = await this.client.query(query, values);
    console.log(
      `Deleted ${result.rowCount} document(s) with fileName: ${fileName} or source: ${source}.`
    );
  }

  async insertVectorDocuments(documents: Document[]) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 50,
    });
    const splitDocs = await splitter.splitDocuments(documents);
    await this.vectorStore.addDocuments(splitDocs);
  }
}
