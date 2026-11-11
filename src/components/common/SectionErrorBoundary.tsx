import { Component, type ErrorInfo, type ReactNode } from 'react'
import { MESSAGES } from '../../constants/messages'
import ErrorState from './ErrorState'

type Props = {
  children: ReactNode
  /** 안내를 감쌀 틀 (예: 섹션 머리·앵커를 유지하려고 AnalysisSection으로 감싼다) */
  wrap?: (fallback: ReactNode) => ReactNode
  /** 이 값이 바뀌면(예: 진단 조건 변경) 오류 상태를 풀고 다시 그린다 */
  resetKey?: string
}

type State = { hasError: boolean }

/**
 * 섹션 하나가 그려지다 멈춰도(예: 응답 형식이 예상과 다름) 나머지 화면은 그대로 보이게 한다.
 * React는 오류 경계를 class 컴포넌트로만 만들 수 있어 이 파일만 예외로 class를 쓴다.
 * 화면에는 기술적인 오류 내용을 보여주지 않는다 (개발 모드에서만 콘솔 출력).
 */
export default class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error('[화면 오류] 섹션 표시 실패', error, info.componentStack)
  }

  componentDidUpdate(prev: Props) {
    if (this.state.hasError && prev.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }

  private retry = () => this.setState({ hasError: false })

  render() {
    if (!this.state.hasError) return this.props.children
    const fallback = <ErrorState message={MESSAGES.common.sectionError} onRetry={this.retry} />
    return this.props.wrap ? this.props.wrap(fallback) : fallback
  }
}
