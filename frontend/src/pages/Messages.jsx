import React, { useState } from 'react';
import { Link } from 'react-router-dom';

//Mock contacts for now..
const CONTACTS = {
  yourNote: ["S.S.K.Perera", "G.D.H.Thejan", "T.T.H.Rehan", "W.S.R.Perera"],
  messages: ["S.S.K.Perera", "G.D.H.Thejan", "T.T.H.Rehan", "W.S.R.Perera", "R.R.T.Alwis", "T.E.R.Sahan", "A.D.D.Mohan"]
};

export default function Messages() {
  const [activeTab, setActiveTab] = useState('messages');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = CONTACTS[activeTab].filter(contact =>
    contact.toLowerCase().includes(searchQuery.toLowerCase())
  );