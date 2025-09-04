import 'dotenv/config';
import app from './app';
import { sequelize } from './models';
import { Umzug, SequelizeStorage } from 'umzug';

const PORT = process.env.PORT || 3000;

const runMigrationsAndStartServer = async () => {
  const migrator = new Umzug({
    migrations: { glob: 'src/migrations/*.ts' },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  await sequelize.authenticate();
  await migrator.up(); 

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
};

runMigrationsAndStartServer().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
