import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, User, Mail, Briefcase } from 'lucide-react';
import axios from 'axios';

const ManageProposals = () => {
  const { ideaId } = useParams();
  const navigate = useNavigate();
  const [idea, setIdea] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [ideaId]);

  const fetchData = async () => {
    try {
      const [ideaRes, proposalsRes] = await Promise.all([
        axios.get(`/api/ideas/${ideaId}`),
        axios.get(`/api/proposals/idea/${ideaId}`)
      ]);
      setIdea(ideaRes.data);
      setProposals(proposalsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 403) {
        alert('You are not authorized to view proposals for this idea');
        navigate('/ideas');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProposalAction = async (proposalId, status) => {
    try {
      await axios.put(`/api/proposals/${proposalId}`, { status });
      alert(`Proposal ${status.toLowerCase()} successfully!`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating proposal:', error);
      alert('Failed to update proposal');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{idea?.title}</h1>
          <p className="text-gray-600 mb-4">Manage proposals for your idea</p>
          <div className="flex gap-4 text-sm">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
              {idea?.category}
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
              Team: {idea?.currentTeamSize || 1}/{idea?.teamSize}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Proposals ({proposals.length})
          </h2>

          {proposals.length === 0 ? (
            <div className="text-center py-12">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No proposals yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Proposals will appear here when people apply to join your idea
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {proposals.map((proposal) => (
                <div
                  key={proposal._id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={proposal.applicant?.avatar || 'https://via.placeholder.com/60'}
                        alt={proposal.applicant?.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-purple-200"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {proposal.applicant?.name}
                        </h3>
                        <p className="text-gray-600 flex items-center gap-2 mt-1">
                          <Mail size={16} />
                          {proposal.applicant?.email}
                        </p>
                        <p className="text-purple-600 flex items-center gap-2 mt-1 font-semibold">
                          <Briefcase size={16} />
                          {proposal.proposedRole}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {proposal.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleProposalAction(proposal._id, 'Accepted')}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition font-semibold"
                          >
                            <CheckCircle size={18} />
                            Accept
                          </button>
                          <button
                            onClick={() => handleProposalAction(proposal._id, 'Rejected')}
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-semibold"
                          >
                            <XCircle size={18} />
                            Reject
                          </button>
                        </>
                      ) : (
                        <span
                          className={`px-4 py-2 rounded-lg font-semibold ${
                            proposal.status === 'Accepted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {proposal.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Message:</h4>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {proposal.message}
                    </p>
                  </div>

                  {proposal.skills && proposal.skills.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {proposal.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {proposal.applicant?.bio && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">About:</h4>
                      <p className="text-gray-600">{proposal.applicant.bio}</p>
                    </div>
                  )}

                  {proposal.applicant?.skills && proposal.applicant.skills.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Applicant's Skills:</h4>
                      <div className="flex flex-wrap gap-2">
                        {proposal.applicant.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 text-sm text-gray-500">
                    Submitted: {new Date(proposal.createdAt).toLocaleDateString()} at{' '}
                    {new Date(proposal.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageProposals;
