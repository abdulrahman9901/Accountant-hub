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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--light-bg)' }}>
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
      <main className="container" style={{ flex: 1, padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {activeTab === 'jobs' ? (
          /* SECTION 1: Browse listings view */
          <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
            
            {/* Sidebar filter controls */}
            <FilterSidebar filters={filters} onChange={handleFiltersChange} />

            {/* Main listing panel grid */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Active Filter Chips bar */}
              <ActiveFilters 
                filters={filters} 
                onClearFilter={handleClearFilter} 
                onClearAll={handleClearAllFilters} 
              />

              {/* Title counters */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={20} style={{ color: 'var(--primary)' }} />
                  Available Postings
                </h2>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Page {currentPage} of {lastPage}
                </span>
              </div>

              {loading ? (
                /* Spinner loader */
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '320px' }}>
                  <RefreshCw className="animate-spin" size={26} style={{ color: 'var(--primary)' }} />
                </div>
              ) : jobs.length === 0 ? (
                /* Empty state screen fallback */
                <div className="glass" style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '80px 24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(1, 154, 81, 0.08)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Sliders size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '6px' }}>No Listings Found</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
                      No jobs matching your filter criteria were found. Try relaxing your filters!
                    </p>
                  </div>
                  <button 
                    onClick={handleClearAllFilters}
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      padding: '10px 20px',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(1, 154, 81, 0.2)'
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                /* Jobs Cards Listing Grid */
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '24px'
                  }}>
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
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '16px',
                      marginTop: '24px',
                      paddingTop: '24px',
                      borderTop: '1px solid var(--border)'
                    }}>
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--border)',
                          padding: '10px 18px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                          opacity: currentPage === 1 ? 0.5 : 1,
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'var(--transition)'
                        }}
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </button>

                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {currentPage} / {lastPage}
                      </span>

                      <button
                        disabled={currentPage === lastPage}
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, lastPage))}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--border)',
                          padding: '10px 18px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: currentPage === lastPage ? 'not-allowed' : 'pointer',
                          opacity: currentPage === lastPage ? 0.5 : 1,
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'var(--transition)'
                        }}
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
        key={selectedJob?.id}
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
