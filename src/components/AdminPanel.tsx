import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { Lock, User, Link as LinkIcon, Plus } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [clientName, setClientName] = useState('');
  const [folderLink, setFolderLink] = useState('');

  const handleLogin = () => {
    if (password === 'Maite2019@' || password === 'Matteo2023') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta.');
    }
  };

  const handleAddClient = async () => {
    try {
      await addDoc(collection(db, 'clients'), {
        name: clientName,
        folderLink: folderLink,
        createdAt: new Date(),
      });
      alert('Cliente cadastrado com sucesso!');
      setClientName('');
      setFolderLink('');
    } catch (e) {
      console.error('Erro ao cadastrar:', e);
      alert('Erro ao cadastrar cliente.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-zinc-900 rounded-2xl border border-zinc-700">
        <Lock className="w-12 h-12 text-zinc-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-4">Acesso Administrativo</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          className="bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-white mb-4"
        />
        <button onClick={handleLogin} className="bg-white text-zinc-900 px-6 py-2 rounded-xl font-bold">
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-zinc-900 rounded-2xl border border-zinc-700 text-white">
      <h2 className="text-2xl font-bold mb-6">Cadastro de Clientes</h2>
      <div className="flex flex-col gap-4">
        <input
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Nome do Cliente"
          className="bg-zinc-800 border border-zinc-700 p-3 rounded-xl"
        />
        <input
          value={folderLink}
          onChange={(e) => setFolderLink(e.target.value)}
          placeholder="URL da Pasta"
          className="bg-zinc-800 border border-zinc-700 p-3 rounded-xl"
        />
        <button onClick={handleAddClient} className="bg-white text-zinc-900 px-6 py-2 rounded-xl font-bold flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Cadastrar Cliente
        </button>
      </div>
    </div>
  );
};
