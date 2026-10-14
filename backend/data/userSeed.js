const bcrypt = require('bcryptjs');
const userRepo = require('./userRepo');

async function seedUsers() {
  const existingUsers = await userRepo.getAll();

  const users = [
    {
      name: 'Workforce HR Admin',
      email: 'hr@workforce.ai',
      password: 'HR@12345',
      role: 'HR',
      employeeId: null
    },
    {
      name: 'Demo Employee',
      email: 'employee@workforce.ai',
      password: 'EMP@12345',
      role: 'EMPLOYEE',
      employeeId: 'EMP-1001'
    }
  ];

  for (const user of users) {
    const exists = existingUsers.find(
      (u) => u.email === user.email
    );

    if (exists) {
      console.log(`[User Seed] ${user.email} already exists.`);
      continue;
    }

    const passwordHash = await bcrypt.hash(user.password, 10);

    await userRepo.create({
      name: user.name,
      email: user.email,
      passwordHash,
      role: user.role,
      employeeId: user.employeeId,
      isActive: true
    });

    console.log(`[User Seed] Created ${user.role}: ${user.email}`);
  }

  console.log('[User Seed] User initialization complete.');
}

module.exports = { seedUsers };