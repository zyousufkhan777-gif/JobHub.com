import React from 'react'
import Hero from '../components/HomeComponents/Hero'
import SearchJobs from '../components/HomeComponents/SearchJobs'
import Jobcategories from '../components/HomeComponents/Jobcategories'
import FeaturedJobs from '../components/HomeComponents/FeaturedJobs'
import TopCompanies from '../components/HomeComponents/TopCompanies'
import HowJobHubWorks from '../components/HomeComponents/HowJobHubWorks'
import CTA from '../components/HomeComponents/CTA'

const Home = () => {
  return (
    <div>
      <Hero />
      <SearchJobs />
      <Jobcategories />
      <FeaturedJobs />
      <TopCompanies />
      <HowJobHubWorks />
      <CTA />
    </div>
  )
}

export default Home