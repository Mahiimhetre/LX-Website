import { Sequelize, DataTypes, Op } from 'sequelize';
import crypto from 'crypto';

const sequelize = new Sequelize('sqlite::memory:', { logging: false });

const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
}, { timestamps: true });

const Profile = sequelize.define('Profile', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

User.hasOne(Profile, { foreignKey: 'userId', as: 'profile', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });

async function performCleanupNPlusOne(usersToDelete) {
    for (const user of usersToDelete) {
        await user.destroy();
    }
}

async function performCleanupOptimized(usersToDelete) {
    if (usersToDelete.length > 0) {
        await User.destroy({
            where: {
                id: {
                    [Op.in]: usersToDelete.map(u => u.id)
                }
            }
        });
    }
}

async function runBenchmark(count) {
  await sequelize.sync({ force: true });

  const users = [];
  const profiles = [];
  const eightDaysAgo = new Date();
  eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

  for (let i = 0; i < count; i++) {
    const userId = crypto.randomUUID();
    users.push({ id: userId, email: `user${i}@example.com`, createdAt: eightDaysAgo, updatedAt: eightDaysAgo });
    profiles.push({ id: crypto.randomUUID(), userId: userId, isVerified: false, createdAt: eightDaysAgo, updatedAt: eightDaysAgo });
  }

  await User.bulkCreate(users);
  await Profile.bulkCreate(profiles);

  const usersToDelete = await User.findAll({ include: [{ model: Profile, as: 'profile', where: { isVerified: false } }] });

  const start1 = performance.now();
  await performCleanupNPlusOne(usersToDelete);
  const end1 = performance.now();
  console.log(`\n--- Count: ${count} ---`);
  console.log(`N+1 Deletion took: ${(end1 - start1).toFixed(2)} ms`);

  // Reset and seed again for optimized
  await sequelize.sync({ force: true });
  await User.bulkCreate(users);
  await Profile.bulkCreate(profiles);

  const usersToDelete2 = await User.findAll({ include: [{ model: Profile, as: 'profile', where: { isVerified: false } }] });

  const start2 = performance.now();
  await performCleanupOptimized(usersToDelete2);
  const end2 = performance.now();
  console.log(`Bulk Deletion took: ${(end2 - start2).toFixed(2)} ms`);
}

async function main() {
    try {
        const counts = [10, 100, 500];
        for (const count of counts) {
            await runBenchmark(count);
        }
    } catch (e) {
        console.error(e);
    }
}

main();
