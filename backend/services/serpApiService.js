require('dotenv').config();
const axios = require('axios');

/**
 * SerpApi Integration Service
 * Searches for:
 * 1. Target Role Jobs (Google Jobs / Organic search)
 * 2. Courses for Missing Skills & Target Topics
 * 3. Certifications for Missing Skills & Target Roles
 */

function isApiKeyConfigured() {
  const apiKey = process.env.SERPAPI_KEY;
  return !!(apiKey && apiKey.trim() !== '' && apiKey !== 'your_serpapi_key_here');
}

async function fetchSerpApiData(query, engine = 'google') {
  if (!isApiKeyConfigured()) {
    return null; // Triggers curated demo fallback
  }

  const apiKey = process.env.SERPAPI_KEY.trim();

  try {
    const params = {
      api_key: apiKey,
      q: query,
      engine: engine,
      hl: 'en',
      gl: 'us'
    };

    if (engine === 'google') {
      params.num = 5;
    }

    const response = await axios.get('https://serpapi.com/search', {
      params,
      timeout: 9000
    });

    return response.data;
  } catch (error) {
    console.warn(`[SerpApi] Request failed for engine "${engine}" query "${query}":`, error.response?.data?.error || error.message);
    return null;
  }
}

async function getJobRecommendations(targetRole) {
  const role = targetRole || 'Full Stack Developer';
  const query = `${role} jobs hiring remote or on-site`;
  const data = await fetchSerpApiData(query, 'google_jobs');

  if (data && data.jobs_results && data.jobs_results.length > 0) {
    return {
      source: 'SerpApi (Live Google Jobs)',
      query,
      items: data.jobs_results.slice(0, 5).map((job) => {
        const applyLink =
          job.apply_options?.[0]?.link ||
          job.share_link ||
          job.job_highlights?.[0]?.items?.[0] ||
          job.related_links?.[0]?.link ||
          `https://www.google.com/search?q=${encodeURIComponent(`${job.title || role} jobs`)}`;

        const tags = [];
        if (job.detected_extensions?.schedule_type) {
          tags.push(job.detected_extensions.schedule_type);
        } else if (job.schedule_type) {
          tags.push(job.schedule_type);
        } else {
          tags.push('Full-time');
        }

        if (job.detected_extensions?.salary) {
          tags.push(job.detected_extensions.salary);
        }

        if (role) tags.push(role);

        return {
          title: job.title || role,
          company: job.company_name || 'Enterprise Tech Corp',
          location: job.location || 'Remote / Hybrid',
          sourceName: job.via || 'Google Jobs',
          link: applyLink,
          snippet: job.description ? job.description.slice(0, 180) + '...' : `Open position for ${role}.`,
          tags
        };
      })
    };
  }

  // If live key is provided but google_jobs had no results, try organic search
  if (isApiKeyConfigured()) {
    const organicData = await fetchSerpApiData(`${role} job openings hiring remote`, 'google');
    if (organicData && organicData.organic_results && organicData.organic_results.length > 0) {
      return {
        source: 'SerpApi (Live Google Search)',
        query,
        items: organicData.organic_results.slice(0, 5).map((res) => ({
          title: res.title || `${role} Opening`,
          company: res.displayed_link ? res.displayed_link.split('/')[0] : 'Career Portal',
          location: 'Remote / US',
          sourceName: res.displayed_link || 'Google Search',
          link: res.link || 'https://www.google.com',
          snippet: res.snippet || `Explore career opportunities for ${role}.`,
          tags: ['Full-time', role]
        }))
      };
    }
  }

  // Graceful curated fallback
  return {
    source: 'Demo Fallback (Configure SERPAPI_KEY for live results)',
    query,
    items: [
      {
        title: `Senior ${role}`,
        company: 'Stripe / Enterprise FinTech',
        location: 'Remote, US',
        sourceName: 'LinkedIn Careers',
        link: 'https://www.linkedin.com/jobs',
        snippet: `Join our team as a ${role}. Scale robust mission-critical systems and collaborate with global talent.`,
        tags: ['Full-time', '$145k-$185k', 'Remote']
      },
      {
        title: `${role} - Product Engineering`,
        company: 'Datadog & Cloud Systems',
        location: 'New York, NY (Hybrid)',
        sourceName: 'Indeed',
        link: 'https://www.indeed.com',
        snippet: `Seeking an experienced ${role} with strong analytical problem-solving and modern toolchain fluency.`,
        tags: ['Full-time', 'Hybrid', 'Fast-growth']
      },
      {
        title: `Staff ${role}`,
        company: 'Apex Global Labs',
        location: 'San Francisco, CA',
        sourceName: 'Google Jobs',
        link: 'https://careers.google.com',
        snippet: `Lead cross-functional architectures as a ${role}. Deep mentorship, modern frameworks, and generous learning budget.`,
        tags: ['Full-time', 'Competitive Equity']
      }
    ]
  };
}

async function getCourseRecommendations(missingSkills = []) {
  const primarySkill = missingSkills[0] || 'Full Stack Development';
  const query = `best ${primarySkill} certification course online coursera edx udemy`;
  const data = await fetchSerpApiData(query, 'google');

  if (data && data.organic_results && data.organic_results.length > 0) {
    return {
      source: 'SerpApi (Live Google Search)',
      query,
      items: data.organic_results.slice(0, 5).map((res) => ({
        title: res.title || `${primarySkill} Specialization`,
        platform: res.displayed_link || 'Coursera / EdX',
        link: res.link || `https://www.coursera.org/search?query=${encodeURIComponent(primarySkill)}`,
        snippet: res.snippet || `Master ${primarySkill} with hands-on labs and peer projects.`,
        skillTargeted: primarySkill,
        rating: 4.8
      }))
    };
  }

  // Curated fallback for missing skills
  const fallbackSkills = missingSkills.length > 0 ? missingSkills.slice(0, 3) : ['Full Stack Development', 'Cloud Architecture', 'Data Analysis'];
  return {
    source: 'Demo Fallback (Configure SERPAPI_KEY for live results)',
    query,
    items: fallbackSkills.map((skill, index) => ({
      title: `${skill} Professional Specialization & Real-World Projects`,
      platform: index % 2 === 0 ? 'Coursera / DeepLearning.AI' : 'Udemy Business / Harvard Online',
      link: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
      snippet: `Comprehensive industry curriculum covering ${skill} fundamentals, design patterns, and applied capstone portfolio builds.`,
      skillTargeted: skill,
      rating: +(4.7 + (index * 0.1)).toFixed(1)
    }))
  };
}

async function getCertificationRecommendations(missingSkills = [], targetRole = '') {
  const skill = missingSkills[0] || targetRole || 'Cloud & Data';
  const query = targetRole && targetRole !== skill
    ? `top industry certifications for ${skill} ${targetRole}`
    : `top industry certifications for ${skill}`;
  const data = await fetchSerpApiData(query, 'google');

  if (data && data.organic_results && data.organic_results.length > 0) {
    return {
      source: 'SerpApi (Live Google Search)',
      query,
      items: data.organic_results.slice(0, 4).map((res) => ({
        title: res.title || `Certified ${skill} Specialist`,
        issuer: res.displayed_link || 'Industry Credential Board',
        link: res.link || `https://www.google.com/search?q=${encodeURIComponent(skill + ' certification')}`,
        snippet: res.snippet || `Industry-standard credential validating mastery in ${skill}.`,
        level: 'Professional',
        skillTargeted: skill
      }))
    };
  }

  return {
    source: 'Demo Fallback (Configure SERPAPI_KEY for live results)',
    query,
    items: [
      {
        title: `Certified ${skill} Professional (Level II)`,
        issuer: 'Global Tech Accreditation Board',
        link: 'https://aws.amazon.com/certification/',
        snippet: `Internationally recognized credential verifying enterprise competencies in ${skill} and modern production workflows.`,
        level: 'Professional',
        skillTargeted: skill
      },
      {
        title: `${targetRole || skill} Applied Practitioner Certification`,
        issuer: 'The Open Group / IEEE Computer Society',
        link: 'https://www.opengroup.org',
        snippet: `Validates foundational, intermediate, and advanced practical mastery required for career mobility to ${targetRole || skill}.`,
        level: 'Associate to Advanced',
        skillTargeted: targetRole || skill
      }
    ]
  };
}

module.exports = {
  getJobRecommendations,
  getCourseRecommendations,
  getCertificationRecommendations,
  isApiKeyConfigured
};
