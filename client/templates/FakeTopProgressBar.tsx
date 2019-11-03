import * as React from 'react';
import FakeProgress from 'fake-progress';

interface Props {
  seconds: number;
  done: boolean;
}

type State = {
  percent: number;
};

/**
 * A fake progress bar which will inch towards 100 unevenly at the top of the page,
 * used for showing the progress of loading code-split assets
 */
export default class FakeTopProgressBar extends React.PureComponent<
  Props,
  State
> {
  updateInterval: ReturnType<typeof setInterval> | null = null;
  fakeProgress: any;
  state: State = { percent: 0 };

  componentDidMount() {
    if (!this.props.done) {
      this.startProgress();
    }
  }

  componentDidUpdate(prevProps: Props) {
    const prevDone = prevProps.done;
    const { done } = this.props;
    if (!prevDone && done) {
      this.stopProgress();
    } else if (prevDone && !done) {
      this.startProgress();
    }
  }

  componentWillUnmount() {
    this.stopProgress();
  }

  startProgress() {
    this.stopProgress();
    this.fakeProgress = new FakeProgress({
      timeConstant: this.props.seconds * 1000,
      autoStart: true,
    });

    this.updateInterval = setInterval(this.updateProgress, 50);
    this.setState({ percent: 5 });
  }

  stopProgress() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.setState({ percent: 0 });
    }
    this.updateInterval = null;
  }

  updateProgress = () => {
    const { percent } = this.state;
    const newPercent = this.fakeProgress.progress * 100;

    // Add up to 50% step jitter
    const actualNewPercent = Math.min(
      percent + (newPercent - percent) * (Math.random() + 0.5) + 5,
      100,
    );

    this.setState({ percent: actualNewPercent });
  };

  render() {
    const { done } = this.props;
    const { percent } = this.state;
    return (
      <div
        className={`FakeTopProgressBar ${
          done ? 'FakeTopProgressBar__done' : ''
        }`}
        style={{ width: `${percent}%` }}
      />
    );
  }
}
