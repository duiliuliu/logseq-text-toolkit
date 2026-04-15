import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    this.setState({ error, errorInfo })
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>设置加载失败</h2>
          <p>请刷新页面重试</p>
          {this.state.error && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>错误信息</summary>
              {this.state.error.toString()}
              {this.state.errorInfo && (
                <div>
                  <strong>Component Stack:</strong>
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </details>
          )}
        </div>
      )
    }
    
    return this.props.children
  }
}

export default ErrorBoundary
