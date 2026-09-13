// src/AppWrite/config.js
import { Client, Databases, ID, Permission, Role } from "appwrite"; // Yaha pe aapka keys ka path
import AppwriteConf from "@/appwriteConfigrationKeys/ConfigrationofAppwrite";


export class Service {
    // for appwrite database "client"
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(AppwriteConf.appwriteUrl) // Your API Endpoint
            .setProject(AppwriteConf.appwriteProjectId); // Your project ID

        this.databases = new Databases(this.client);
    }
    // CREATE DOCUMENT
    async createNote({ Notes_title, slug, Notes_contents, notes_images, Is_note_important, User_Unique_ID }) {
        try {
            return await this.databases.createDocument(
                AppwriteConf.appwriteDataBaseId,
                AppwriteConf.appwriteCollectionId,
                ID.unique(), // Document ID (Unique identifier for the note)
                {
                    "notes_title": Notes_title,
                    "notes_contect": Notes_contents,
                    "notes_images": notes_images,
                    "is_note_important": Is_note_important,
                    "user_unique_id": User_Unique_ID,
                    "slug": slug,
                },
                [
                    Permission.read(Role.user(User_Unique_ID)),
                    Permission.write(Role.user(User_Unique_ID)),
                    Permission.update(Role.user(User_Unique_ID)),
                    Permission.delete(Role.user(User_Unique_ID))
                ]
            )
        } catch (error) {
            throw error;
        }
    }

    // UPDATE DOCUMENT
    async updateNote(noteuniqueid, { slug, Notes_title, Notes_contents, notes_images, Is_note_important }) {
        try {
            return await this.databases.updateDocument(
                AppwriteConf.appwriteDataBaseId,
                AppwriteConf.appwriteCollectionId,
                noteuniqueid,
                {
                    "notes_title": Notes_title,
                    "notes_contect": Notes_contents,
                    "notes_images": notes_images,
                    "is_note_important": Is_note_important,
                    "slug": slug,
                }
            )
        } catch (error) {
            throw error;
        }
    }

    // DELETE DOCUMENT
    async deleteNote(noteuniqueid) {
        try {
            await this.databases.deleteDocument(
                AppwriteConf.appwriteDataBaseId,
                AppwriteConf.appwriteCollectionId,
                noteuniqueid
            )
            return true;
        } catch (error) {
            throw error;
        }
    }

    // GET SINGLE DOCUMENT
    async getNote(noteuniqueid) {
        try {
            return await this.databases.getDocument(
                AppwriteConf.appwriteDataBaseId,
                AppwriteConf.appwriteCollectionId,
                noteuniqueid
            )
        } catch (error) {
            throw error;
        }
    }

    // GET ALL DOCUMENTS
    async getNotes(queries = []) {
        try {
            return await this.databases.listDocuments(
                AppwriteConf.appwriteDataBaseId,
                AppwriteConf.appwriteCollectionId,
                queries
            )
        } catch (error) {
            throw error;
        }
    }
}

const service = new Service();
export default service;
