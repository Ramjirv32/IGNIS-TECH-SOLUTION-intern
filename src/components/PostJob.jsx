import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';

function PostJob({ isOpen, onClose, onJobPosted, editJob }) {
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    type: 'Full-time',
    postedago: 'Just now',
    isremote: false,
    tags: []
  });

  useEffect(() => {
    if (!isOpen) {
      setJobData({
        title: '',
        company: '',
        description: '',
        location: '',
        type: 'Full-time',
        postedago: 'Just now',
        isremote: false,
        tags: []
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (editJob) {
      setJobData({
        ...editJob,
        tags: editJob.tags || []
      });
    }
  }, [editJob]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editJob 
        ? `http://localhost:8000/jobLists/${editJob.id}`
        : 'http://localhost:8000/jobLists';
      
      const method = editJob ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData),
      });
      
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: editJob ? 'Job Updated!' : 'Job Posted!',
          text: editJob ? 'Job has been updated successfully.' : 'New job has been posted successfully.',
          timer: 1500,
          showConfirmButton: false
        });
        onClose();
        if (onJobPosted) onJobPosted();
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: errorData.error || 'Failed to save job.'
        });
      }
    } catch (error) {
      console.error('Error saving job:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to save job.'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {editJob ? 'Edit Job' : 'Post a New Job'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Job Title</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={jobData.title}
              onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Company</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={jobData.company}
              onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="remote, senior, javascript"
              onChange={(e) => setJobData({ 
                ...jobData, 
                tags: e.target.value.split(',').map(tag => tag.trim()) 
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Job Type</label>
            <select
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={jobData.type}
              onChange={(e) => setJobData({ ...jobData, type: e.target.value })}
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={jobData.location}
              onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isRemote"
              className="h-4 w-4 text-blue-600 rounded"
              checked={jobData.isremote}
              onChange={(e) => setJobData({ ...jobData, isremote: e.target.checked })}
            />
            <label htmlFor="isRemote" className="ml-2 text-sm text-gray-700">
              This is a remote position
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Job Description</label>
            <textarea
              required
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              value={jobData.description}
              onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Post Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostJob; 