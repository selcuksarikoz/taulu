import { app } from "electron";
import fs from "fs";
import path from "path";
import crypto from "crypto";

class SimpleStore {
  private filePath: string;
  private encryptionKey: string | undefined;
  private data: Record<string, any> = {};

  constructor(
    options: {
      name?: string;
      encryptionKey?: string;
      clearInvalidConfig?: boolean;
    } = {},
  ) {
    const name = options.name || "config";
    this.encryptionKey = options.encryptionKey;
    this.filePath = path.join(app.getPath("userData"), `${name}.json`);

    // Load data from file
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        let fileContent = fs.readFileSync(this.filePath, "utf8");

        // Decrypt if encryption key is provided
        if (this.encryptionKey) {
          try {
            fileContent = this.decrypt(fileContent);
          } catch (err) {
            console.error("Failed to decrypt file, starting with empty store");
            return;
          }
        }

        this.data = JSON.parse(fileContent);
      }
    } catch (error) {
      console.error("Failed to load store from disk:", error);
      this.data = {};
    }
  }

  private saveToDisk(): void {
    try {
      let fileContent = JSON.stringify(this.data);

      // Encrypt if encryption key is provided
      if (this.encryptionKey) {
        fileContent = this.encrypt(fileContent);
      }

      // Ensure directory exists
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.filePath, fileContent);
    } catch (error) {
      console.error("Failed to save store to disk:", error);
    }
  }

  private encrypt(data: string): string {
    if (!this.encryptionKey) return data;

    const iv = crypto.randomBytes(16);
    const key = crypto
      .createHash("sha256")
      .update(this.encryptionKey)
      .digest()
      .slice(0, 32);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    return iv.toString("hex") + ":" + encrypted;
  }

  private decrypt(data: string): string {
    if (!this.encryptionKey) return data;

    const parts = data.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    const key = crypto
      .createHash("sha256")
      .update(this.encryptionKey)
      .digest()
      .slice(0, 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }

  // Main API methods

  // Get a value (with optional default)
  get(key: string, defaultValue?: any): any {
    const value = this.has(key) ? this.data[key] : undefined;
    return value !== undefined ? value : defaultValue;
  }

  // Set a value or multiple values
  set(key: string | Record<string, any>, value?: any): void {
    if (typeof key === "object") {
      // Set multiple values at once
      this.data = { ...this.data, ...key };
    } else {
      // Set single value
      this.data[key] = value;
    }

    this.saveToDisk();
  }

  // Check if a key exists
  has(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.data, key);
  }

  // Delete a key
  delete(key: string): void {
    delete this.data[key];
    this.saveToDisk();
  }

  getAll() {
    try {
      return this.data;
    } catch (error) {
      return {};
    }
  }

  // Clear all data
  clear(): void {
    this.data = {};
    this.saveToDisk();
  }
}

// For use elsewhere in your app
export { SimpleStore };
