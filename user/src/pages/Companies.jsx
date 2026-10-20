import React from 'react'
import CompaniesHero from '../components/CompaniesComponents/CompaniesHero'
import Search from '../components/common/Search'
import SearchCompony from '../components/CompaniesComponents/SearchCompony'
import AllCompanies from '../components/CompaniesComponents/AllCompanies'

const Companies = () => {
  return (
    <div>
      <CompaniesHero />
      <AllCompanies />
    </div>
  )
}

export default Companies