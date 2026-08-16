// import React from "react";
// import { useNavigate } from "react-router-dom";
// import OwnerListings from "../listings/OwnerListings";
// import TenantListings from "../listings/TenantListings";
// import TenantBookings from "../bookings/TenantBookings";
// import LoginHeader from "../../components/LoginHeader";

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem("user") || "null");

//   if (!user) {
//     navigate("/login", { replace: true });
//     return null;
//   }

//   return (
//     <div className="page-shell dashboard-page">
//       <LoginHeader />
//       <section className="dashboard-hero surface-card">
//         <div>
//           <div className="eyebrow">Welcome back</div>
//           <h2>{user.name}</h2>
//           <p className="muted">Role: {user.role}</p>
//         </div>
//       </section>

//       {user.role === "owner" ? (
//         <section className="dashboard-section">
//           <h3>Owner dashboard</h3>
//           <p className="muted">
//             Here you can manage your listings and view applicants.
//           </p>
//           <OwnerListings showHeader={false} />
//         </section>
//       ) : (
//         <>
//           <section className="dashboard-section">
//             <h3>Tenant dashboard</h3>
//             <p className="muted">
//               Here you can search listings and contact owners.
//             </p>
//             <TenantListings showHeader={false} />
//           </section>

//           <section className="dashboard-section">
//             <TenantBookings showHeader={false} />
//           </section>
//         </>
//       )}
//     </div>
//   );
// };

// export default Dashboard;







import React from "react";
import { useNavigate } from "react-router-dom";
import OwnerListings from "../listings/OwnerListings";
import TenantListings from "../listings/TenantListings";
// import TenantBookings from "../bookings/TenantBookings";
import LoginHeader from "../../components/LoginHeader";

const KeyIcon = () => (
  <svg
    viewBox="0 0 48 48"
    width="26"
    height="26"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true">
    <circle cx="16" cy="24" r="9" />
    <line x1="23" y1="24" x2="41" y2="24" />
    <line x1="34" y1="24" x2="34" y2="30" />
    <line x1="39" y1="24" x2="39" y2="29" />
  </svg>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

  const isOwner = user.role === "owner";
  const roleCopy = isOwner
    ? "You're set up to manage listings and review applicants."
    : "You're set up to browse listings and track your requests.";

  return (
    <div className={`page-shell dashboard-page dashboard-page--${user.role}`}>
      <LoginHeader />

      <section className="dashboard-hero dashboard-plaque surface-card">
        <div className="dashboard-plaque__icon">
          <KeyIcon />
        </div>
        <div className="dashboard-plaque__body">
          <div className="eyebrow">Welcome back</div>
          <h2 className="dashboard-plaque__name">{user.name}</h2>
          <span className="role-badge">{user.role}</span>
          <p className="muted dashboard-plaque__sub">{roleCopy}</p>
        </div>
      </section>

      <div className="dashboard-tour">
        <div
          className="dashboard-tour__line"
          aria-hidden="true"
        />

        {isOwner ? (
          <section className="dashboard-section">
            <div className="dashboard-section__head">
              <span className="section-tag">Manage</span>
              <h3>Owner dashboard</h3>
            </div>
            <p className="muted">
              Here you can manage your listings and view applicants.
            </p>
            <OwnerListings showHeader={false} />
          </section>
        ) : (
          <>
            <section className="dashboard-section">
              <div className="dashboard-section__head">
                <span className="section-tag">Browse</span>
                <h3>Tenant dashboard</h3>
              </div>
              <p className="muted">
                Here you can search listings and contact owners.
              </p>
              <TenantListings showHeader={false} />
            </section>

            {/* <section className="dashboard-section">
              <TenantBookings showHeader={false} />
            </section> */}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;