module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 1,
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'Local:         http://localhost:3000',
      settings: {
        chromeFlags: ['--no-sandbox']
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.5 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.5 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
}
