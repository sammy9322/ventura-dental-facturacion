import jwt from 'jsonwebtoken';
import { config } from './server/src/config/index.js';
import fetch from 'node-fetch';

async function test() {
  const token = jwt.sign({ id: 2, username: 'doctor1', rol: 'doctor' }, config.jwt.secret, { expiresIn: '1h' });
  console.log('Generated token for doctor:', token);

  const res = await fetch('http://localhost:3000/api/pagos', {
    headers: { Authorization: `Bearer ${token}` }
  });

  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Body:', text);
}

test();
