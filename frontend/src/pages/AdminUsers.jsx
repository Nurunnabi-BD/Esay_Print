import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Users, Search, GraduationCap, School, Mail, Hash } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await axiosClient.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (error) {
      console.error('Failed to load students DB', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const query = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(query) ||
      u.studentId?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.department?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-md">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">Students Database</h1>
            <p className="text-sm text-dark-400">Total registered printing students: {filteredUsers.length} accounts.</p>
          </div>
        </div>
      </div>

      {/* Search Input bar */}
      <div className="flex bg-dark-950 border border-dark-800 p-4 rounded-2xl justify-end">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-dark-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by ID, name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-xl bg-dark-950 border border-dark-800 py-2.5 pl-9 pr-3 text-xs text-white placeholder-dark-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* Student List cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass rounded-3xl py-20 flex flex-col items-center justify-center text-center p-6">
          <Users className="h-12 w-12 text-dark-500 mb-3" />
          <h3 className="text-lg font-bold text-white">No students found</h3>
          <p className="text-xs text-dark-400 max-w-sm mt-1">
            No registered student records matching your search query were found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((student) => (
            <div key={student._id} className="glass rounded-3xl p-5 border border-dark-850 space-y-4 hover:border-brand-500/20 transition-all">
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-brand-900/20 border border-brand-700/30 flex items-center justify-center text-brand-400 font-extrabold text-sm">
                  {student.name ? student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'ST'}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-white truncate">{student.name}</h3>
                  <span className="text-[10px] text-dark-500 block mt-0.5">Joined {new Date(student.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-dark-400 border-t border-dark-900 pt-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-dark-500 shrink-0" />
                  <span className="font-semibold text-white">{student.studentId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-dark-500 shrink-0" />
                  <span className="truncate">{student.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4 text-dark-500 shrink-0" />
                  <span className="uppercase">{student.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-dark-500 shrink-0" />
                  <span>{student.semester}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
