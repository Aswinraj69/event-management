'use client';

import { useState, useEffect } from 'react';
import { UserPlus, ShieldCheck, Mail, Phone, CalendarCheck2, ShieldAlert, Award, FileSearch, Trash2, Edit3, X } from 'lucide-react';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // New Employee Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'EMPLOYEE',
    employeeId: '',
    gender: 'Male',
    dob: '',
    nationality: 'UAE',
    designation: 'Photographer',
    employeeType: 'PERMANENT',
    address: '',
    skills: '',
    passportNumber: '',
    passportExpiry: '',
    visaNumber: '',
    visaExpiry: '',
    emiratesId: '',
    drivingLicense: ''
  });

  const [onboardedResult, setOnboardedResult] = useState<any | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);

  const fetchEmployees = async () => {
    const token = localStorage.getItem('evento_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (err) {
      console.error('Error fetching employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('evento_token');

    // Parse comma separated skills
    const skillsArray = formData.skills
      ? formData.skills.split(',').map(s => s.trim()).filter(s => s !== '')
      : [];

    const payload = {
      ...formData,
      skills: skillsArray
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Onboarding failed');
        return;
      }
      setOnboardedResult(data);
      setShowAddForm(false);
      fetchEmployees();

      // Reset form
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'EMPLOYEE',
        employeeId: '',
        gender: 'Male',
        dob: '',
        nationality: 'UAE',
        designation: 'Photographer',
        employeeType: 'PERMANENT',
        address: '',
        skills: '',
        passportNumber: '',
        passportExpiry: '',
        visaNumber: '',
        visaExpiry: '',
        emiratesId: '',
        drivingLicense: ''
      });
    } catch (err) {
      alert('Error during server communication');
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to suspend this employee?')) return;
    const token = localStorage.getItem('evento_token');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/employees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchEmployees();
        setSelectedEmployee(null);
      }
    } catch (err) {
      alert('Deactivation request failed');
    }
  };

  // Expiry styling checks
  const getExpiryBadgeClass = (expiryDateStr: string | null) => {
    if (!expiryDateStr) return 'text-gray-500 bg-gray-500/5 border-gray-500/10';
    const exp = new Date(expiryDateStr);
    const today = new Date();
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-400 bg-red-500/10 border-red-500/20'; // Expired
    if (diffDays < 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'; // Expiring soon
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'; // Valid
  };

  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase()) || emp.email.toLowerCase().includes(search.toLowerCase()) || (emp.employeeProfile?.designation || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? emp.role === roleFilter : true;
    const matchesType = typeFilter ? emp.employeeProfile?.employeeType === typeFilter : true;
    return matchesSearch && matchesRole && matchesType;
  });

  return (
    <div className="space-y-8 animate-fade-in relative">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Employees & Freelancers</h1>
          <p className="text-gray-400 text-sm mt-1">Manage staff roles, track nationalities, and verify visas.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg transition-all"
        >
          <UserPlus className="w-4 h-4" /> Onboard Staff
        </button>
      </header>

      {/* Modal for Provisioned Credentials */}
      {onboardedResult && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-fade-in relative">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3 items-center">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Employee Onboarded successfully!</h3>
                <p className="text-xs text-gray-500">Record inserted into User and EmployeeProfile tables.</p>
              </div>
            </div>
            <button onClick={() => setOnboardedResult(null)} className="text-gray-500 hover:text-white text-xs">Dismiss</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/40 p-4 rounded-xl border border-white/[0.05] text-xs">
            <div>
              <p className="text-gray-500">Onboarded Name</p>
              <p className="font-semibold text-white mt-1">{onboardedResult.firstName} {onboardedResult.lastName}</p>
            </div>
            <div>
              <p className="text-gray-500">Login Username (Email)</p>
              <p className="font-semibold text-white mt-1">{onboardedResult.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Temporary Password</p>
              <p className="font-mono text-white mt-1">{onboardedResult.temporaryPassword}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search by name, email or skills..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-[#0f0f13] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500 text-xs text-white"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 bg-[#0f0f13] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500 text-xs text-gray-400"
        >
          <option value="">All Roles</option>
          <option value="EMPLOYEE">Employee</option>
          <option value="FREELANCER">Freelancer</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 bg-[#0f0f13] border border-white/[0.06] rounded-xl focus:outline-none focus:border-violet-500 text-xs text-gray-400"
        >
          <option value="">All Types</option>
          <option value="PERMANENT">Permanent</option>
          <option value="FREELANCER">Freelancer</option>
          <option value="PART_TIME">Part-Time</option>
          <option value="VENDOR_STAFF">Vendor Staff</option>
        </select>
      </div>

      {/* Main Roster Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Table column */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-xs text-gray-500">Loading roster profiles...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">No employees match filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.05] bg-white/[0.01]">
                    <th className="p-4 font-bold text-gray-400">Employee Details</th>
                    <th className="p-4 font-bold text-gray-400">Type / Designation</th>
                    <th className="p-4 font-bold text-gray-400">Visa / Passport Expiry</th>
                    <th className="p-4 font-bold text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => (
                    <tr
                      key={emp.id}
                      onClick={() => setSelectedEmployee(emp)}
                      className={`border-b border-white/[0.03] hover:bg-white/[0.01] cursor-pointer transition-colors ${
                        selectedEmployee?.id === emp.id ? 'bg-white/[0.02]' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-600/10 flex items-center justify-center font-bold text-violet-400">
                            {emp.firstName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{emp.firstName} {emp.lastName}</p>
                            <span className="text-[10px] text-gray-500 block mt-0.5">{emp.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-gray-300">{emp.employeeProfile?.designation || 'Specialist'}</p>
                        <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded mt-1 inline-block font-bold">
                          {emp.employeeProfile?.employeeType || 'PERMANENT'}
                        </span>
                      </td>
                      <td className="p-4 space-y-1">
                        <div>
                          <span className={`px-1.5 py-0.5 text-[9px] border rounded font-semibold ${getExpiryBadgeClass(emp.employeeProfile?.visaExpiry)}`}>
                            Visa: {emp.employeeProfile?.visaExpiry ? new Date(emp.employeeProfile.visaExpiry).toISOString().split('T')[0] : 'None'}
                          </span>
                        </div>
                        <div>
                          <span className={`px-1.5 py-0.5 text-[9px] border rounded font-semibold ${getExpiryBadgeClass(emp.employeeProfile?.passportExpiry)}`}>
                            Pass: {emp.employeeProfile?.passportExpiry ? new Date(emp.employeeProfile.passportExpiry).toISOString().split('T')[0] : 'None'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          emp.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {emp.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Inspector column */}
        <div>
          {selectedEmployee ? (
            <div className="glass-panel p-6 rounded-2xl animate-fade-in space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full bg-violet-600/10 flex items-center justify-center font-bold text-violet-400">
                    {selectedEmployee.firstName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-md">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {selectedEmployee.employeeProfile?.employeeId || 'N/A'}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEmployee(null)} className="text-gray-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Personal details info list */}
              <div className="space-y-4 text-xs border-t border-white/[0.05] pt-4">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Contact & Credentials</h4>
                <div className="flex items-center gap-2 text-gray-300">
                  <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="truncate">{selectedEmployee.email}</span>
                </div>
                {selectedEmployee.phone && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Phone className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>{selectedEmployee.phone}</span>
                  </div>
                )}
                {selectedEmployee.employeeProfile?.nationality && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <CalendarCheck2 className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>Nationality: {selectedEmployee.employeeProfile.nationality}</span>
                  </div>
                )}
              </div>

              {/* Skills checklist */}
              <div className="space-y-3 border-t border-white/[0.05] pt-4 text-xs">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Capabilities
                </h4>
                {selectedEmployee.employeeProfile?.skills && selectedEmployee.employeeProfile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEmployee.employeeProfile.skills.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-300 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-600 italic">No skills listed</span>
                )}
              </div>

              {/* Documents expirations inspector */}
              <div className="space-y-3 border-t border-white/[0.05] pt-4 text-xs">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <FileSearch className="w-3.5 h-3.5" /> Expiry Tracker
                </h4>
                <div className="space-y-2 bg-black/30 p-3 rounded-xl border border-white/[0.04]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Emirates ID</span>
                    <span className="text-white font-medium">{selectedEmployee.employeeProfile?.emiratesId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Driving License</span>
                    <span className="text-white font-medium">{selectedEmployee.employeeProfile?.drivingLicense || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Visa Expiry</span>
                    <span className={`font-mono text-[10px] px-1.5 rounded ${getExpiryBadgeClass(selectedEmployee.employeeProfile?.visaExpiry)}`}>
                      {selectedEmployee.employeeProfile?.visaExpiry ? new Date(selectedEmployee.employeeProfile.visaExpiry).toISOString().split('T')[0] : 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Passport Expiry</span>
                    <span className={`font-mono text-[10px] px-1.5 rounded ${getExpiryBadgeClass(selectedEmployee.employeeProfile?.passportExpiry)}`}>
                      {selectedEmployee.employeeProfile?.passportExpiry ? new Date(selectedEmployee.employeeProfile.passportExpiry).toISOString().split('T')[0] : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions footer */}
              {selectedEmployee.isActive && (
                <div className="border-t border-white/[0.05] pt-4 flex gap-2">
                  <button
                    onClick={() => handleDeactivate(selectedEmployee.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 font-semibold rounded-xl text-xs transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Suspend Member
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-8 text-center rounded-2xl text-xs text-gray-500 border-dashed">
              Select an employee row to inspect visa credentials, driving license details, and profile metrics.
            </div>
          )}
        </div>
      </div>

      {/* Onboarding Sliding / Dialog Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-[#0f0f13] border border-white/[0.08] rounded-2xl max-w-2xl w-full p-8 max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setShowAddForm(false)} className="absolute right-6 top-6 text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="mb-6">
              <h3 className="text-xl font-bold">Onboard New Team Member</h3>
              <p className="text-xs text-gray-500 mt-1">This registers credentials and compiles a new EmployeeProfile.</p>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">First Name</label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Last Name</label>
                  <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Email Address</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Phone</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Platform Role</label>
                  <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-gray-400">
                    <option value="EMPLOYEE">Employee</option>
                    <option value="FREELANCER">Freelancer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Employee Type</label>
                  <select name="employeeType" value={formData.employeeType} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-gray-400">
                    <option value="PERMANENT">Permanent</option>
                    <option value="FREELANCER">Freelancer</option>
                    <option value="PART_TIME">Part-Time</option>
                    <option value="VENDOR_STAFF">Vendor Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Designation</label>
                  <input type="text" name="designation" required value={formData.designation} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/[0.04] pt-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Passport Number</label>
                  <input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Passport Expiry</label>
                  <input type="date" name="passportExpiry" value={formData.passportExpiry} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Visa Number</label>
                  <input type="text" name="visaNumber" value={formData.visaNumber} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Visa Expiry</label>
                  <input type="date" name="visaExpiry" value={formData.visaExpiry} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Emirates ID</label>
                  <input type="text" name="emiratesId" value={formData.emiratesId} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Driving License</label>
                  <input type="text" name="drivingLicense" value={formData.drivingLicense} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Skills / Capabilities (Comma separated)</label>
                <input type="text" name="skills" placeholder="Photographer, Drone, Lighting..." value={formData.skills} onChange={handleInputChange} className="w-full px-3 py-2 bg-black/40 border border-white/[0.08] rounded-xl text-xs text-white" />
              </div>

              <div className="pt-4 border-t border-white/[0.04] flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-white/[0.08] text-xs font-semibold rounded-xl text-gray-400 hover:text-white">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-xl shadow-lg">
                  Submit Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
