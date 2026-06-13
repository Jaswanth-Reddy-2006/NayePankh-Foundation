import bcrypt from "bcryptjs";
import { query } from "./db";

export async function seedDatabase() {
  try {
    // 1. Drop existing tables if they exist in dependency order
    await query("DROP TABLE IF EXISTS certificates CASCADE;");
    await query("DROP TABLE IF EXISTS applications CASCADE;");
    await query("DROP TABLE IF EXISTS events CASCADE;");
    await query("DROP TABLE IF EXISTS users CASCADE;");

    console.log("Dropped existing tables");

    // 2. Create tables
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'volunteer',
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        phone VARCHAR(50) DEFAULT '',
        dob VARCHAR(50) DEFAULT '',
        gender VARCHAR(50) DEFAULT '',
        address TEXT DEFAULT '',
        education VARCHAR(255) DEFAULT '',
        skills TEXT[] DEFAULT '{}',
        interests TEXT[] DEFAULT '{}',
        profile_image TEXT DEFAULT '',
        volunteer_hours INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Events table
    await query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        date TIMESTAMP NOT NULL,
        time VARCHAR(100) NOT NULL,
        venue VARCHAR(255) NOT NULL,
        required_volunteers INT NOT NULL DEFAULT 1,
        banner_image TEXT DEFAULT '',
        status VARCHAR(50) NOT NULL DEFAULT 'open',
        skills_required TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Applications table
    await query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        volunteer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        hours_logged INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(volunteer_id, event_id)
      );
    `);

    // Certificates table
    await query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        volunteer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verification_code VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(volunteer_id, event_id)
      );
    `);

    console.log("Created tables successfully");

    // 3. Hash passwords
    const hashedPassword = await bcrypt.hash("password123", 12);
    const adminPassword = await bcrypt.hash("admin123", 12);

    // 4. Seed Users
    // Admin
    const adminResult = await query(
      `INSERT INTO users (name, email, password, role, status, phone, dob, gender, address, profile_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        "Alex Johnson",
        "admin@volunteerhub.org",
        adminPassword,
        "admin",
        "approved",
        "9876543210",
        "1990-05-15",
        "Male",
        "123 NGO HQ Street, City",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      ]
    );

    // Volunteers
    const vol1Result = await query(
      `INSERT INTO users (name, email, password, role, status, phone, dob, gender, address, education, skills, interests, volunteer_hours, profile_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
      [
        "John Doe",
        "john@gmail.com",
        hashedPassword,
        "volunteer",
        "approved",
        "8887776665",
        "1995-10-20",
        "Male",
        "742 Evergreen Terrace, Springfield",
        "Bachelor of Science in Education",
        ["Teaching", "Communication", "Public Speaking", "First Aid"],
        ["Education", "Children", "Disaster Relief"],
        25,
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      ]
    );

    const vol2Result = await query(
      `INSERT INTO users (name, email, password, role, status, phone, dob, gender, address, education, skills, interests, volunteer_hours, profile_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
      [
        "Sarah Smith",
        "sarah@gmail.com",
        hashedPassword,
        "volunteer",
        "approved",
        "7776665554",
        "1998-03-12",
        "Female",
        "10 Downing Street, London",
        "Medical Student (3rd Year)",
        ["First Aid", "Patient Care", "Organization", "Languages"],
        ["Health", "Elderly Care", "Education"],
        40,
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      ]
    );

    const vol3Result = await query(
      `INSERT INTO users (name, email, password, role, status, phone, dob, gender, address, education, skills, interests, volunteer_hours, profile_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
      [
        "Michael Brown",
        "michael@gmail.com",
        hashedPassword,
        "volunteer",
        "pending",
        "6665554443",
        "2001-08-05",
        "Male",
        "55 Broadway, New York",
        "High School Graduate",
        ["Manual Labor", "Gardening", "Driving"],
        ["Environment", "Animal Welfare"],
        0,
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      ]
    );

    await query(
      `INSERT INTO users (name, email, password, role, status, phone, dob, gender, address, education, skills, interests, volunteer_hours, profile_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        "Emily Davis",
        "emily@gmail.com",
        hashedPassword,
        "volunteer",
        "rejected",
        "5554443332",
        "1996-12-30",
        "Female",
        "24 Sussex Drive, Ottawa",
        "Bachelor of Arts in Sociology",
        ["Event Planning", "Social Media", "Writing"],
        ["Environment", "Elderly Care"],
        0,
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      ]
    );

    const v1Id = vol1Result.rows[0].id;
    const v2Id = vol2Result.rows[0].id;
    const v3Id = vol3Result.rows[0].id;

    console.log("Seeded users");

    // 5. Seed Events
    const dateOffset = (days: number) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString();
    };

    const e1Result = await query(
      `INSERT INTO events (title, description, category, date, time, venue, required_volunteers, banner_image, skills_required, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        "Weekend Teaching Camp for Kids",
        "Join us for a fun teaching camp where we teach basic Math and English to underprivileged children in the local community center. All materials will be provided.",
        "Education",
        dateOffset(7),
        "9:00 AM - 1:00 PM",
        "Community Education Center, Hall A",
        5,
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600",
        ["Teaching", "Communication", "Patience"],
        "open",
      ]
    );

    const e2Result = await query(
      `INSERT INTO events (title, description, category, date, time, venue, required_volunteers, banner_image, skills_required, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        "Free Health Checkup & Blood Donation Camp",
        "Assisting doctors and managing queues at the free health checkup clinic. We are also running a blood donation drive in collaboration with the Red Cross.",
        "Health",
        dateOffset(14),
        "10:00 AM - 4:00 PM",
        "St. Jude Hospital Plaza",
        10,
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600",
        ["First Aid", "Patient Care", "Organization"],
        "open",
      ]
    );

    const e3Result = await query(
      `INSERT INTO events (title, description, category, date, time, venue, required_volunteers, banner_image, skills_required, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        "Mega Beach Cleanup and Tree Planting",
        "Help clean up plastic waste from the public beach and plant native trees along the coastal green belt. Eco-friendly bags and gloves will be provided.",
        "Environment",
        dateOffset(-5),
        "7:00 AM - 11:00 AM",
        "Sunrise Beach Coastline",
        8,
        "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600",
        ["Manual Labor", "Gardening"],
        "closed",
      ]
    );

    const e4Result = await query(
      `INSERT INTO events (title, description, category, date, time, venue, required_volunteers, banner_image, skills_required, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        "Emergency Food Pack Distribution",
        "Packaging and delivering emergency ration kits and hot meals to families affected by the recent localized flooding. Physical stamina is preferred.",
        "Disaster Relief",
        dateOffset(-15),
        "8:00 AM - 3:00 PM",
        "City Relief Center, warehouse 4",
        15,
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600",
        ["Manual Labor", "Driving", "First Aid"],
        "closed",
      ]
    );

    const e1Id = e1Result.rows[0].id;
    const e2Id = e2Result.rows[0].id;
    const e3Id = e3Result.rows[0].id;
    const e4Id = e4Result.rows[0].id;

    console.log("Seeded events");

    // 6. Seed Applications
    // Volunteer 1 (John) applications
    await query(
      `INSERT INTO applications (volunteer_id, event_id, status, hours_logged) VALUES ($1, $2, $3, $4)`,
      [v1Id, e1Id, "pending", 0]
    );
    await query(
      `INSERT INTO applications (volunteer_id, event_id, status, hours_logged) VALUES ($1, $2, $3, $4)`,
      [v1Id, e3Id, "approved", 10]
    );
    await query(
      `INSERT INTO applications (volunteer_id, event_id, status, hours_logged) VALUES ($1, $2, $3, $4)`,
      [v1Id, e4Id, "approved", 15]
    );

    // Volunteer 2 (Sarah) applications
    await query(
      `INSERT INTO applications (volunteer_id, event_id, status, hours_logged) VALUES ($1, $2, $3, $4)`,
      [v2Id, e1Id, "approved", 0]
    );
    await query(
      `INSERT INTO applications (volunteer_id, event_id, status, hours_logged) VALUES ($1, $2, $3, $4)`,
      [v2Id, e2Id, "pending", 0]
    );
    await query(
      `INSERT INTO applications (volunteer_id, event_id, status, hours_logged) VALUES ($1, $2, $3, $4)`,
      [v2Id, e3Id, "approved", 15]
    );
    await query(
      `INSERT INTO applications (volunteer_id, event_id, status, hours_logged) VALUES ($1, $2, $3, $4)`,
      [v2Id, e4Id, "approved", 25]
    );

    // Volunteer 3 (Michael) applications
    await query(
      `INSERT INTO applications (volunteer_id, event_id, status, hours_logged) VALUES ($1, $2, $3, $4)`,
      [v3Id, e2Id, "pending", 0]
    );

    console.log("Seeded applications");

    // 7. Seed Certificates
    await query(
      `INSERT INTO certificates (volunteer_id, event_id, verification_code, issue_date) VALUES ($1, $2, $3, $4)`,
      [v1Id, e3Id, "VAL-BEACH-JHN-1234", dateOffset(-4)]
    );
    await query(
      `INSERT INTO certificates (volunteer_id, event_id, verification_code, issue_date) VALUES ($1, $2, $3, $4)`,
      [v1Id, e4Id, "VAL-FOOD-JHN-5678", dateOffset(-14)]
    );
    await query(
      `INSERT INTO certificates (volunteer_id, event_id, verification_code, issue_date) VALUES ($1, $2, $3, $4)`,
      [v2Id, e3Id, "VAL-BEACH-SRH-8888", dateOffset(-4)]
    );
    await query(
      `INSERT INTO certificates (volunteer_id, event_id, verification_code, issue_date) VALUES ($1, $2, $3, $4)`,
      [v2Id, e4Id, "VAL-FOOD-SRH-9999", dateOffset(-14)]
    );

    console.log("Seeded certificates");

    return {
      success: true,
      message: "Neon PostgreSQL database initialized and seeded successfully!",
    };
  } catch (error: any) {
    console.error("PostgreSQL Seeding error:", error);
    throw error;
  }
}
