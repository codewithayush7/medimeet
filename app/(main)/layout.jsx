import React from 'react'

function MainLayout({children}) {
  return (
    <div className="container mx-auto my-20">
      {children}
    </div>
  )
}

export default MainLayout
