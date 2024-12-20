import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Search, Briefcase, Building2, MapPin, Clock, Filter, Pencil, Trash2, MoreVertical, X } from 'lucide-react';
import PostJob from './PostJob';
import Swal from 'sweetalert2';

function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showActions, setShowActions] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    jobType: null,
    workplace: null,
    location: null,
    seniority: null
  });
  const [showFilter, setShowFilter] = useState(null);

  const filterOptions = {
    jobType: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    workplace: ['Remote', 'On-site', 'Hybrid'],
    location: ['India', 'Worldwide'],
    seniority: ['Entry Level', 'Mid Level', 'Senior']
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:8000/jobLists');
        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }
        const data = await response.json();
        setJobs(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const refreshJobs = async () => {
    try {
      const response = await fetch('http://localhost:8000/jobLists');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error refreshing jobs:', error);
    }
  };

  const handleDelete = async (jobId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:8000/jobLists/${jobId}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            Swal.fire({
              title: 'Deleted!',
              text: 'Job has been deleted successfully.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            refreshJobs();
          } else {
            throw new Error('Failed to delete job');
          }
        } catch (error) {
          console.error('Error deleting job:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete job.',
            icon: 'error'
          });
        }
      }
    });
  };

  const handleFilterClick = (filterType) => {
    setShowFilter(showFilter === filterType ? null : filterType);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActions && 
          !event.target.closest('.dropdown-menu') && 
          !event.target.closest('.dropdown-button')) {
        setShowActions(null);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActions]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading jobs...</div>
      </div>
    );
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesJobType = !activeFilters.jobType || job.type === activeFilters.jobType;
    const matchesWorkplace = !activeFilters.workplace || 
      (activeFilters.workplace === 'Remote' && job.isremote) ||
      (activeFilters.workplace === 'On-site' && !job.isremote);
    const matchesLocation = !activeFilters.location || job.location.includes(activeFilters.location);
    const matchesSeniority = !activeFilters.seniority || 
      job.tags.some(tag => tag.toLowerCase().includes(activeFilters.seniority.toLowerCase()));

    return matchesSearch && matchesJobType && matchesWorkplace && 
           matchesLocation && matchesSeniority;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img
                className="h-8 w-auto"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Logo"
              />
              
            </div>
            <div className="flex items-center space-x-4">
              {auth.currentUser ? (
                <>
                  <div className="flex items-center">
                    <img
                      src={auth.currentUser.photoURL || "https://via.placeholder.com/40"}
                      alt="Profile"
                      className="h-8 w-8 rounded-full mr-2"
                    />
                    <span className="text-gray-700">{auth.currentUser.displayName}</span>
                  </div>
                  <button 
                    onClick={() => setIsPostJobOpen(true)} 
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Post a job
                  </button>
                  <button 
                    onClick={handleSignOut} 
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => navigate("/")} 
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by job title or company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Filters */}
          <div className="flex gap-4 mt-4 relative">
            <button 
              onClick={() => handleFilterClick('jobType')}
              className={`flex items-center px-4 py-2 border rounded-md hover:bg-gray-50 ${
                activeFilters.jobType ? 'border-blue-500 text-blue-600' : ''
              }`}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Job type
            </button>

            <button 
              onClick={() => handleFilterClick('workplace')}
              className={`flex items-center px-4 py-2 border rounded-md hover:bg-gray-50 ${
                activeFilters.workplace ? 'border-blue-500 text-blue-600' : ''
              }`}
            >
              <Building2 className="h-4 w-4 mr-2" />
              Workplace
            </button>

            <button 
              onClick={() => handleFilterClick('location')}
              className={`flex items-center px-4 py-2 border rounded-md hover:bg-gray-50 ${
                activeFilters.location ? 'border-blue-500 text-blue-600' : ''
              }`}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Country or timezone
            </button>

            <button 
              onClick={() => handleFilterClick('seniority')}
              className={`flex items-center px-4 py-2 border rounded-md hover:bg-gray-50 ${
                activeFilters.seniority ? 'border-blue-500 text-blue-600' : ''
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Seniority
            </button>

            {/* Filter Dropdown */}
            {showFilter && (
              <div className="absolute top-full mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
                <div className="py-1">
                  {filterOptions[showFilter].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setActiveFilters(prev => ({
                          ...prev,
                          [showFilter]: option
                        }));
                        setShowFilter(null);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear filters button */}
            {Object.values(activeFilters).some(filter => filter) && (
              <button
                onClick={() => setActiveFilters({
                  jobType: null,
                  workplace: null,
                  location: null,
                  seniority: null
                })}
                className="ml-auto flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
              >
                <X className="h-4 w-4 mr-2" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Job Listings */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-600">
              Found {filteredJobs.length} jobs
            </div>
            <button className="flex items-center px-4 py-2 border rounded-md bg-white">
              <Filter className="h-4 w-4 mr-2" />
              Most recent
            </button>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <p className="text-gray-500">No jobs found matching your search.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow mb-4 p-6 hover:shadow-md transition-shadow relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-4 right-4 flex items-center z-20">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActions(showActions === job.id ? null : job.id);
                      }}
                      className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 focus:outline-none bg-gray-50 hover:bg-gray-100 rounded-full dropdown-button"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {showActions === job.id && (
                      <div 
                        className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-50 dropdown-menu"
                      >
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJob(job);
                              setIsPostJobOpen(true);
                              setShowActions(null);
                            }}
                            className="group flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                          >
                            <Pencil className="mr-3 h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                            Edit Job
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(job.id);
                              setShowActions(null);
                            }}
                            className="group flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
                            Delete Job
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-start pr-12">
                  <div>
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <Clock className="h-4 w-4 mr-1" />
                      {job.postedago}
                      <span className="mx-2">•</span>
                      {job.tags && job.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className={`mr-2 ${
                            tag.toLowerCase().includes('remote') 
                              ? 'text-green-600' 
                              : tag.toLowerCase().includes('on-site')
                              ? 'text-blue-600'
                              : 'text-purple-600'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 mb-2">{job.company}</p>
                    <p className="text-gray-500 text-sm">{job.description}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {job.isremote && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        Remote
                      </span>
                    )}
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      {job.location}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {job.type}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <PostJob 
        isOpen={isPostJobOpen} 
        onClose={() => {
          setIsPostJobOpen(false);
          setSelectedJob(null);
        }}
        onJobPosted={refreshJobs}
        editJob={selectedJob}
      />
    </div>
  );
}

export default Home;

