
import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada.');
  }

  const rl = createInterface({ input: stdin, output: stdout });

  try {
    const username = (await rl.question('Nome de usuário do administrador: ')).trim();

    if (!/^[a-zA-Z0-9._-]{3,100}$/.test(username)) {
      throw new Error(
        'Use de 3 a 100 caracteres: letras, números, ponto, hífen ou sublinhado.'
      );
    }

    const password = await askHiddenPassword();

    if (password.length < 12) {
      throw new Error('A senha deve ter pelo menos 12 caracteres.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO admin_users (username, password_hash)
       VALUES ($1, $2)`,
      [username, passwordHash]
    );

    console.log('Administrador cadastrado com sucesso.');
  } finally {
    rl.close();
  }
}

async function askHiddenPassword(): Promise<string> {
  stdout.write('Senha do administrador (mínimo 12 caracteres): ');

  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error('Execute o script diretamente em um terminal interativo.');
  }

  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  return new Promise((resolve, reject) => {
    let password = '';

    const cleanup = () => {
      stdin.removeListener('data', onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write('\n');
    };

    const onData = (key: string) => {
      if (key === '\u0003') {
        cleanup();
        reject(new Error('Operação cancelada.'));
        return;
      }

      if (key === '\r' || key === '\n') {
        cleanup();
        resolve(password);
        return;
      }

      if (key === '\u007f' || key === '\b') {
        password = password.slice(0, -1);
        return;
      }

      if (key >= ' ' && key !== '\u007f') {
        password += key;
      }
    };

    stdin.on('data', onData);
  });
}

main()
  .catch((error: unknown) => {
    if (
      error instanceof Error &&
      error.message.includes('duplicate key')
    ) {
      console.error('Esse nome de usuário já está cadastrado.');
    } else {
      console.error(
        error instanceof Error ? error.message : 'Falha ao cadastrar administrador.'
      );
    }

    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
