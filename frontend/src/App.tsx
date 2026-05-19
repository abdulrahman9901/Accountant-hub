import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FilterSidebar, type FilterState } from './components/FilterSidebar';
import { ActiveFilters } from './components/ActiveFilters';
import { JobCard } from './components/JobCard';
import { JobDetails } from './components/JobDetails';
import { BidDashboard } from './components/BidDashboard';
import { LoginModal } from './components/LoginModal';
import { RegisterModal } from './components/RegisterModal';
import { request } from './api/client';
import type { Job } from './types';
import { Briefcase, ChevronLeft, ChevronRight, Sliders, RefreshCw } from 'lucide-react';
import './styles/App.css';

export const App: React.FC = () => {
  // Navigation layout state
  const [activeTab, setActiveTab] = useState<'jobs' | 'dashboard'>('jobs');
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Job Listing filters and listings state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    min_budget: '',
    max_budget: '',
    sort_by: 'newest'
  });
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load jobs matching dynamic filters and refresh counters
  useEffect(() => {
    let active = true;

    const loadJobs = async () => {
      try {
        if (active) setLoading(true);
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.min_budget) params.append('min_budget', filters.min_budget);
        if (filters.max_budget) params.append('max_budget', filters.max_budget);
        params.append('sort_by', filters.sort_by);
        params.append('page', currentPage.toString());

        const response = await request<Job[]>(`/jobs?${params.toString()}`);
        
        if (active) {
          setJobs(response.data);
          if (response.meta) {
            setLastPage(response.meta.last_page);
          }
        }
      } catch (err) {
        console.error('Failed to load jobs data', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadJobs();

    return () => {
      active = false;
    };
  }, [filters, currentPage, refreshTrigger]);

  // Synchronous filter update handlers that reset pagination page safely
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleClearFilter = useCallback((key: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [key]: '' }));
    setCurrentPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      min_budget: '',
      max_budget: '',
      sort_by: 'newest'
    });
    setCurrentPage(1);
  }, []);

  const handleSelectJobById = useCallback(async (jobId: number) => {
    try {
      const response = await request<Job>(`/jobs/${jobId}`);
      setSelectedJob(response.data);
    } catch (err) {
      console.error('Failed to fetch job by ID', err);
    }
  }, []);

  const handleBidSuccess = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
    if (selectedJob) {
      handleSelectJobById(selectedJob.id);
    }
  }, [selectedJob, handleSelectJobById]);

  return (
    <div className="app-wrapper">
      {/* Stick navbar header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenAuth={(mode) => {
          if (mode === 'login') {
            setLoginOpen(true);
          } else {
            setRegisterOpen(true);
          }
        }} 
      />

      {/* Main layout container */}
      <main className="container app-main">
        {activeTab === 'jobs' ? (
          /* SECTION 1: Browse listings view */
          <div className="browse-layout">
            
            {/* Sidebar filter controls */}
            <FilterSidebar filters={filters} onChange={handleFiltersChange} />

            {/* Main listing panel grid */}
            <div className="listing-panel">
              
              {/* Active Filter Chips bar */}
              <ActiveFilters 
                filters={filters} 
                onClearFilter={handleClearFilter} 
                onClearAll={handleClearAllFilters} 
              />

              {/* Title counters */}
              <div className="listing-header-bar">
                <h2 className="listing-title">
                  <Briefcase size={20} className="listing-title-icon" />
                  Available Postings
                </h2>
                <span className="listing-page-indicator">
                  Page {currentPage} of {lastPage}
                </span>
              </div>

              {loading ? (
                /* Spinner loader */
                <div className="listing-loader-wrap">
                  <RefreshCw className="animate-spin" size={26} style={{ color: 'var(--primary)' }} />
                </div>
              ) : jobs.length === 0 ? (
                /* Empty state screen fallback */
                <div className="glass listing-empty-card">
                  <div className="listing-empty-icon-wrap">
                    <Sliders size={28} />
                  </div>
                  <div>
                    <h3 className="listing-empty-title">No Listings Found</h3>
                    <p className="listing-empty-text">
                      No jobs matching your filter criteria were found. Try relaxing your filters!
                    </p>
                  </div>
                  <button 
                    onClick={handleClearAllFilters}
                    className="btn-listing-empty-action"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                /* Jobs Cards Listing Grid */
                <>
                  <div className="jobs-cards-grid">
                    {jobs.map((job) => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        onClick={() => setSelectedJob(job)} 
                      />
                    ))}
                  </div>

                  {/* Pagination triggers */}
                  {lastPage > 1 && (
                    <div className="pagination-bar">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        className="btn-pagination"
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </button>

                      <span className="pagination-indicator">
                        {currentPage} / {lastPage}
                      </span>

                      <button
                        disabled={currentPage === lastPage}
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, lastPage))}
                        className="btn-pagination"
                      >
                        Next
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          /* SECTION 2: My Proposals Dashboard view */
          <BidDashboard onSelectJobId={handleSelectJobById} />
        )}
      </main>

      {/* Auth Login Modal */}
      <LoginModal 
        isOpen={loginOpen} 
        onClose={() => setLoginOpen(false)} 
        onSwitchToRegister={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }} 
      />

      {/* Auth Registration Modal */}
      <RegisterModal 
        isOpen={registerOpen} 
        onClose={() => setRegisterOpen(false)} 
        onSwitchToLogin={() => {
          setRegisterOpen(false);
          setLoginOpen(true);
        }} 
      />

      {/* Right Slide Job Detail & Bid form drawer */}
      <JobDetails 
        job={selectedJob} 
        onClose={() => setSelectedJob(null)} 
        onOpenAuth={(mode) => {
          if (mode === 'login') {
            setLoginOpen(true);
          } else {
            setRegisterOpen(true);
          }
        }}
        onBidSuccess={handleBidSuccess}
      />
    </div>
  );
};

export default App;
