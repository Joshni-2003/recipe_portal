
import './ReviewReports.css';
import { useEffect, useMemo, useState } from 'react';
import { recipes as recipeImageLibrary } from '../data/recipes';

const storageKey = 'recipe-review-reports';

function loadReports() {
    try {
        const savedReports = localStorage.getItem(storageKey);
        if (!savedReports) return [];

        const parsedReports = JSON.parse(savedReports);
        return Array.isArray(parsedReports) ? parsedReports : [];
    } catch (error) {
        console.error('Unable to load reports:', error);
        return [];
    }
}

function getRecipe(report) {
    return recipeImageLibrary.find((recipe) => {
        const ids = [recipe.id, recipe._id, recipe.recipeId]
            .filter((id) => id !== undefined && id !== null);

        return (
            ids.some((id) => String(id) === String(report.recipeId)) ||
            (
                report.recipeName &&
                recipe.name?.trim().toLowerCase() ===
                report.recipeName.trim().toLowerCase()
            )
        );
    });
}

function ReviewReports() {
    const [reports, setReports] = useState(loadReports);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(reports));
        } catch (error) {
            console.error('Unable to save reports:', error);
        }
    }, [reports]);

    function updateReportStatus(reportId, status) {
        setReports((previous) =>
            previous.map((report) =>
                String(report.id) === String(reportId)
                    ? { ...report, status }
                    : report
            )
        );
    }

    function updateReviewVisibility(report, shouldHide) {
        const reviewStorageKey = `recipe-reviews-${report.recipeId}`;

        try {
            const savedReviews = localStorage.getItem(reviewStorageKey);

            if (!savedReviews) {
                alert('Reviews not found for this recipe.');
                return;
            }

            const recipeReviews = JSON.parse(savedReviews);

            if (!Array.isArray(recipeReviews)) {
                alert('Invalid review data.');
                return;
            }

            let reviewFound = false;

            const updatedReviews = recipeReviews.map((review) => {
                if (String(review.id) === String(report.reviewId)) {
                    reviewFound = true;
                    return { ...review, isHidden: shouldHide };
                }
                return review;
            });

            if (!reviewFound) {
                alert('The reported review was not found.');
                return;
            }

            localStorage.setItem(
                reviewStorageKey,
                JSON.stringify(updatedReviews)
            );

            setReports((previous) =>
                previous.map((item) =>
                    String(item.id) === String(report.id)
                        ? { ...item, reviewHidden: shouldHide }
                        : item
                )
            );

            alert(
                shouldHide
                    ? 'Review hidden successfully!'
                    : 'Review restored successfully!'
            );
        } catch (error) {
            console.error('Unable to update review:', error);
            alert('Something went wrong while updating the review.');
        }
    }

    const pendingCount = reports.filter(
        (report) => report.status === 'Pending'
    ).length;

    const reviewedCount = reports.filter(
        (report) => report.status === 'Reviewed'
    ).length;

    const dismissedCount = reports.filter(
        (report) => report.status === 'Dismissed'
    ).length;

    const filteredReports = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return reports.filter((report) => {
            const matchesStatus =
                filterStatus === 'All' ||
                (report.status || 'Pending') === filterStatus;

            const recipe = getRecipe(report);

            const searchableText = [
                report.reviewName,
                report.reviewComment,
                report.reason,
                report.reportedBy,
                report.recipeId,
                report.recipeName,
                recipe?.name
            ].filter(Boolean).join(' ').toLowerCase();

            return matchesStatus && searchableText.includes(search);
        });
    }, [reports, filterStatus, searchTerm]);

    const heroRecipe = recipeImageLibrary.find(
        (recipe) => recipe.image
    );

    const filterOptions = ['All', 'Pending', 'Reviewed', 'Dismissed'];

    return (
        <main className="review-reports-page">

            {/* HERO SECTION */}
            <section className="reports-hero">

                <div className="hero-decoration hero-circle-one" />
                <div className="hero-decoration hero-circle-two" />

                <div className="reports-hero-content">

                    <span className="hero-label">
                        ADMIN ANALYTICS
                    </span>

                    <h1>
                        Reports &amp;
                        <br />
                        Analytics
                    </h1>

                    <p>
                        Track reported reviews, monitor community activity
                        and maintain quality content across your recipe portal.
                    </p>

                    <span className="hero-line" />

                </div>

                <div className="reports-hero-image">
                    {heroRecipe?.image && (
                        <img
                            src={heroRecipe.image}
                            alt={heroRecipe.name || 'Featured food'}
                        />
                    )}
                </div>

            </section>

            {/* OVERVIEW */}
            <section className="reports-overview">

                <div className="overview-heading">
                    <span className="section-label">OVERVIEW</span>
                    <h2>Portal Performance</h2>
                    <p>
                        A complete overview of your reported reviews
                        and moderation statistics.
                    </p>
                </div>

                <div className="report-statistics">

                    <div className="report-stat-card total-stat">
                        <div className="stat-icon">▤</div>
                        <div className="stat-information">
                            <span>Total Reports</span>
                            <h3>{reports.length}</h3>
                            <p>All reported reviews</p>
                        </div>
                    </div>

                    <div className="report-stat-card pending-stat">
                        <div className="stat-icon">◷</div>
                        <div className="stat-information">
                            <span>Pending</span>
                            <h3>{pendingCount}</h3>
                            <p>Awaiting review</p>
                        </div>
                    </div>

                    <div className="report-stat-card reviewed-stat">
                        <div className="stat-icon">✓</div>
                        <div className="stat-information">
                            <span>Reviewed</span>
                            <h3>{reviewedCount}</h3>
                            <p>Successfully addressed</p>
                        </div>
                    </div>

                    <div className="report-stat-card dismissed-stat">
                        <div className="stat-icon">×</div>
                        <div className="stat-information">
                            <span>Dismissed</span>
                            <h3>{dismissedCount}</h3>
                            <p>No action required</p>
                        </div>
                    </div>

                </div>

            </section>

            {/* MODERATION CENTER */}
            <section className="reports-moderation">

                <div className="moderation-heading">

                    <div>
                        <span className="section-label">
                            MODERATION CENTER
                        </span>

                        <h2>Reported Reviews</h2>

                        <p>
                            Review and manage reported reviews submitted
                            by your community.
                        </p>
                    </div>

                    <span className="reports-count">
                        {filteredReports.length} Reports
                    </span>

                </div>

                {/* FILTER AND SEARCH */}
                <div className="report-toolbar">

                    <div className="report-filter-tabs">
                        {filterOptions.map((option) => (
                            <button
                                key={option}
                                className={
                                    filterStatus === option
                                        ? 'filter-tab active'
                                        : 'filter-tab'
                                }
                                onClick={() => setFilterStatus(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    <div className="report-search">
                        <span>⌕</span>
                        <input
                            type="search"
                            placeholder="Search reports..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />
                    </div>

                </div>

                {/* REPORTED REVIEWS */}
                <div className="reports-list">

                    {filteredReports.length === 0 ? (

                        <div className="no-reports">
                            <div className="empty-icon">▤</div>
                            <h3>No reports found</h3>
                            <p>
                                {searchTerm
                                    ? 'Try changing your search or filter.'
                                    : 'There are no reports in this category.'}
                            </p>
                        </div>

                    ) : (

                        filteredReports.map((report) => {
                            const recipe = getRecipe(report);
                            const recipeName =
                                report.recipeName ||
                                recipe?.name ||
                                `Recipe #${report.recipeId}`;

                            return (
                                <article
                                    className="reported-review-card"
                                    key={report.id}
                                >

                                    {/* RECIPE IMAGE */}
                                    <div className="report-recipe-image">
                                        {recipe?.image ? (
                                            <img
                                                src={recipe.image}
                                                alt={recipeName}
                                            />
                                        ) : (
                                            <div className="image-placeholder">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    {/* REVIEW DETAILS */}
                                    <div className="report-details">

                                        <span className="report-eyebrow">
                                            REPORTED RECIPE REVIEW
                                        </span>

                                        <h3>{recipeName}</h3>

                                        <p className="review-author">
                                            Reviewed by:{' '}
                                            <strong>
                                                {report.reviewName || 'Unknown'}
                                            </strong>
                                        </p>

                                        <blockquote>
                                            “{report.reviewComment ||
                                                'No review comment provided.'}”
                                        </blockquote>

                                        <div className="report-meta">
                                            <span>
                                                ★ Rating: {report.reviewRating ?? '—'} / 5
                                            </span>
                                            <span>
                                                Reported by: {report.reportedBy || 'Unknown'}
                                            </span>
                                            <span>
                                                ▣ {report.date || 'Date unavailable'}
                                            </span>
                                        </div>

                                    </div>

                                    {/* STATUS */}
                                    <div className="report-status-area">
                                        <span className={`report-status ${(report.status || 'Pending').toLowerCase()}`}>
                                            {report.status || 'Pending'}
                                        </span>
                                    </div>

                                    {/* EXTRA INFORMATION */}
                                    <div className="report-extra">

                                        <div>
                                            <span>REPORT REASON</span>
                                            <strong>
                                                {report.reason || 'Not specified'}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>ADDITIONAL DETAILS</span>
                                            <strong>
                                                {report.details ||
                                                    'No additional details provided.'}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>REVIEW VISIBILITY</span>
                                            <strong className={
                                                report.reviewHidden
                                                    ? 'hidden-text'
                                                    : 'visible-text'
                                            }>
                                                {report.reviewHidden ? 'Hidden' : 'Visible'}
                                            </strong>
                                        </div>

                                    </div>

                                    {/* ACTIONS */}
                                    <div className="report-actions">

                                        {report.status === 'Pending' && (
                                            <>
                                                <button
                                                    className="mark-reviewed-btn"
                                                    onClick={() =>
                                                        updateReportStatus(
                                                            report.id,
                                                            'Reviewed'
                                                        )
                                                    }
                                                >
                                                    ✓ Review
                                                </button>

                                                <button
                                                    className="dismiss-report-btn"
                                                    onClick={() =>
                                                        updateReportStatus(
                                                            report.id,
                                                            'Dismissed'
                                                        )
                                                    }
                                                >
                                                    × Dismiss
                                                </button>
                                            </>
                                        )}

                                        {!report.reviewHidden ? (
                                            <button
                                                className="hide-review-btn"
                                                onClick={() =>
                                                    updateReviewVisibility(
                                                        report,
                                                        true
                                                    )
                                                }
                                            >
                                                ⊘ Hide Review
                                            </button>
                                        ) : (
                                            <button
                                                className="restore-review-btn"
                                                onClick={() =>
                                                    updateReviewVisibility(
                                                        report,
                                                        false
                                                    )
                                                }
                                            >
                                                ↶ Restore Review
                                            </button>
                                        )}

                                    </div>

                                </article>
                            );
                        })

                    )}

                </div>

            </section>

        </main>
    );
}

export default ReviewReports;
