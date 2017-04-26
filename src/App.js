/**
 * @providesModule App
 */
'use strict'

import React, {
  Component,
  PropTypes
} from 'react';

import {
  Alert,
  View,
  Text,
  Image,
  Button,
  Animated,
  Easing,
  ScrollView,
  PanResponder,
  Platform,
  StatusBar,
  StyleSheet,
  Dimensions,
} from 'react-native';

const ScrollState = {
  BEGIN: 'BEGIN',
  ARRIVE: 'ARRIVE',
  ORIGIN: 'ORIGIN',
}

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentIndex: 2,
      pages: ['page1', 'page2', 'page3', 'page4', 'page5'],
      scrollEnabled: true,
    }

    // 是否是初始化设置滚动条位置
    this.init = true;
    // 页签滚动状态下变量
    // 状态
    this.tabScrollState = ScrollState.ORIGIN;
    // 页签滚动条滚动完成
    this.tabScrollComplete = false;
    // 场景滚动条滚动完成
    this.sceneScrollComplete = false;
    // 场景滚动状态下变量
    // 状态
    this.sceneScrollState = ScrollState.ORIGIN;

    this.tabScrollMiddleOffset = Math.round(Dimensions.get('window').width * 1);
    this.tabScrollLeftOffset = Math.round(Dimensions.get('window').width * 0.5);
    this.tabScrollRightOffset = Math.round(Dimensions.get('window').width * 1.5);

    this.sceneScrollMiddleOffset = Math.round(Dimensions.get('window').width * 2);
    this.sceneScrollLeftOffset = Math.round(Dimensions.get('window').width * 1);
    this.sceneScrollRightOffset = Math.round(Dimensions.get('window').width * 3);
  }

  componentDidMount() {
    this.init = true;
    if (Platform.OS === 'android') {
      setTimeout(() => {
        this.tabScroll.scrollTo({
          x: this.tabScrollMiddleOffset,
          y: 0,
          animated: false
        });
        this.sceneScroll.scrollTo({
          x: this.sceneScrollMiddleOffset,
          y: 0,
          animated: false
        });
      }, 0);
    }
  }

  tabScrollPress(isLeft) {
    this.tabScrollState = ScrollState.BEGIN;
    this.tabScrollComplete = false;
    this.sceneScrollComplete = false;
    this.tabScroll.scrollTo({
      x: isLeft ? this.tabScrollLeftOffset : this.tabScrollRightOffset,
      y: 0,
      animated: true
    });
    this.sceneScroll.scrollTo({
      x: isLeft ? this.sceneScrollLeftOffset : this.sceneScrollRightOffset,
      y: 0,
      animated: true
    });
  }

  isArriveOffset(offset, constOffset) {
    if (Platform.OS === 'ios') {
      if (offset <= constOffset + 1 && offset >= constOffset - 1) {
        return true
      } else {
        return false
      }
    } else {
      if (offset == constOffset) {
        return true
      } else {
        return false
      }
    }
  }

  resetTabScroll() {
    this.tabScroll.scrollTo({
      x: this.tabScrollMiddleOffset,
      y: 0,
      animated: false
    });
    this.sceneScroll.scrollTo({
      x: this.sceneScrollMiddleOffset,
      y: 0,
      animated: false
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (Platform.OS === 'android') {
      if (prevState.currentIndex != this.state.currentIndex) {
        this.timer = setTimeout(() => {
          this.setState({ scrollEnabled: true });
          this.resetTabScroll();
          this.lock = false
        }, 300);
      }
    }
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextState.currentIndex != this.state.currentIndex) {
      if (Platform.OS === 'android') {
        this.lock = true
      }
      this.resetTabScroll();
    }
  }


  onScroll(tabScrollContentOffsetX, sceneScrollContentOffsetX, secondPageIndex, fourthPageIndex, firstPageIndex, fifthPageIndex) {
    if (this.tabScrollState != ScrollState.ORIGIN) {
      if (this.tabScrollState != ScrollState.ARRIVE) {
        if (this.isArriveOffset(tabScrollContentOffsetX, this.tabScrollLeftOffset) && sceneScrollContentOffsetX == null) {
          this.tabScrollState = ScrollState.ARRIVE
          this.setState({ currentIndex: secondPageIndex });
        } else if (this.isArriveOffset(tabScrollContentOffsetX, this.tabScrollRightOffset) && sceneScrollContentOffsetX == null) {
          this.tabScrollState = ScrollState.ARRIVE
          this.setState({ currentIndex: fourthPageIndex });
        }
      } else {
        // 判断滚动结束
        if (this.isArriveOffset(tabScrollContentOffsetX, this.tabScrollMiddleOffset) && sceneScrollContentOffsetX == null) {
          this.tabScrollComplete = true;
        }
        if (this.isArriveOffset(sceneScrollContentOffsetX, this.sceneScrollMiddleOffset) && tabScrollContentOffsetX == null) {
          this.sceneScrollComplete = true;
        }

        if (this.tabScrollComplete && this.sceneScrollComplete) {
          this.tabScrollState = ScrollState.ORIGIN
        }
      }
    } else {
      if (this.init == true) {
        this.init = false;
        return;
      }

      // 开始启动！
      if (!this.isArriveOffset(sceneScrollContentOffsetX, this.sceneScrollMiddleOffset) &&
        this.sceneScrollState == ScrollState.ORIGIN &&
        tabScrollContentOffsetX == null) {
        if (Platform.OS === 'android') {
          if (!this.lock) {
            this.sceneScrollState = ScrollState.BEGIN;
          }
        } else {
          this.sceneScrollState = ScrollState.BEGIN;
        }
      }

      // 等待就绪
      if (this.sceneScrollState == ScrollState.BEGIN && tabScrollContentOffsetX == null) {
        this.tabScroll.scrollTo({
          x: (sceneScrollContentOffsetX / 2),
          y: 0,
          animated: false
        });
        if (Platform.OS === 'android') {
          if (this.timer) {
            clearTimeout(this.timer);
          }
        }

        if (this.isArriveOffset(sceneScrollContentOffsetX, this.sceneScrollLeftOffset)) {
          if (Platform.OS === 'android') {
            // android paging bug
            this.timer = setTimeout(() => {
              this.sceneScrollState = ScrollState.ARRIVE;
              this.setState({ currentIndex: secondPageIndex, scrollEnabled: false });
            }, 300);
          } else {
            this.sceneScrollState = ScrollState.ARRIVE;
            this.setState({ currentIndex: secondPageIndex });
          }
        } else if (this.isArriveOffset(sceneScrollContentOffsetX, this.sceneScrollRightOffset)) {
          if (Platform.OS === 'android') {
            // android paging bug
            this.timer = setTimeout(() => {
              this.sceneScrollState = ScrollState.ARRIVE;
              this.setState({ currentIndex: fourthPageIndex, scrollEnabled: false });
            }, 300);
          } else {
            this.sceneScrollState = ScrollState.ARRIVE;
            this.setState({ currentIndex: fourthPageIndex });
          }
        } else if (this.isArriveOffset(sceneScrollContentOffsetX, 0)) {
          if (Platform.OS === 'android') {
            // android paging bug
            this.timer = setTimeout(() => {
              this.sceneScrollState = ScrollState.ARRIVE;
              this.setState({ currentIndex: firstPageIndex, scrollEnabled: false });
            }, 300);
          } else {
            this.sceneScrollState = ScrollState.ARRIVE;
            this.setState({ currentIndex: firstPageIndex });
          }
        } else if (this.isArriveOffset(sceneScrollContentOffsetX, Math.round(Dimensions.get('window').width * 4))) {
          if (Platform.OS === 'android') {
            // android paging bug
            this.timer = setTimeout(() => {
              this.sceneScrollState = ScrollState.ARRIVE;
              this.setState({ currentIndex: fifthPageIndex, scrollEnabled: false });
            }, 300);
          } else {
            this.sceneScrollState = ScrollState.ARRIVE;
            this.setState({ currentIndex: fifthPageIndex });
          }
        } else if (this.isArriveOffset(sceneScrollContentOffsetX, this.sceneScrollMiddleOffset)) {
          if (Platform.OS === 'android') {
            // android paging bug
            if (this.timer) {
              clearTimeout(this.timer);
            }
            this.sceneScrollState = ScrollState.ORIGIN;
          } else {
            this.sceneScrollState = ScrollState.ORIGIN;
          }

        }
      } else if (this.sceneScrollState == ScrollState.ARRIVE && this.isArriveOffset(sceneScrollContentOffsetX, this.sceneScrollMiddleOffset) && tabScrollContentOffsetX == null) {
        this.sceneScrollState = ScrollState.ORIGIN;
      }
    }
  }

  render() {
    let totalCount = this.state.pages.length;
    let firstPageIndex;
    let secondPageIndex;
    let thirdPageIndex;
    let fourthPageIndex;
    let fifthPageIndex;
    if (totalCount == 1) {
      firstPageIndex = 0;
      secondPageIndex = 0
      thirdPageIndex = 0
      fourthPageIndex = 0
      fifthPageIndex = 0
    } else {
      firstPageIndex = this.state.currentIndex - 2 >= 0 ? this.state.currentIndex - 2 : this.state.currentIndex - 2 + totalCount
      secondPageIndex = this.state.currentIndex - 1 >= 0 ? this.state.currentIndex - 1 : this.state.currentIndex - 1 + totalCount
      thirdPageIndex = this.state.currentIndex
      fourthPageIndex = this.state.currentIndex + 1 >= totalCount ? this.state.currentIndex + 1 - totalCount : this.state.currentIndex + 1
      fifthPageIndex = this.state.currentIndex + 2 >= totalCount ? this.state.currentIndex + 2 - totalCount : this.state.currentIndex + 2
    }

    return (
      <View style={{ flex: 1, position: 'relative' }}>
        <View>
          <ScrollView ref={scroll => this.tabScroll = scroll} showsHorizontalScrollIndicator={false} contentOffset={{ x: this.tabScrollMiddleOffset, y: 0 }} scrollEnabled={false} horizontal={true} style={{ backgroundColor: 'red', height: 50, marginTop: 20 }}
            onScroll={(native) => {
              this.onScroll(Math.round(native.nativeEvent.contentOffset.x), null, secondPageIndex, fourthPageIndex, firstPageIndex, fifthPageIndex);
            }}
          >
            <View style={{
              width: Dimensions.get('window').width / 4
            }}></View>
            <Text style={{
              width: Dimensions.get('window').width / 2,
              textAlign: 'center',
              lineHeight: 50,
              fontWeight: 'bold',
              fontSize: 30,
            }}>{this.state.pages[firstPageIndex]}</Text>
            <Text onPress={() => {
              this.tabScrollPress(true);
            }} style={{
              width: Dimensions.get('window').width / 2,
              textAlign: 'center',
              lineHeight: 50,
              fontWeight: 'bold',
              fontSize: 30,
            }}>{this.state.pages[secondPageIndex]}</Text>
            <Text style={{
              width: Dimensions.get('window').width / 2,
              textAlign: 'center',
              lineHeight: 50,
              fontWeight: 'bold',
              fontSize: 30,
            }}>{this.state.pages[thirdPageIndex]}</Text>
            <Text onPress={() => {
              this.tabScrollPress(false);
            }} style={{
              width: Dimensions.get('window').width / 2,
              textAlign: 'center',
              lineHeight: 50,
              fontWeight: 'bold',
              fontSize: 30,
            }}>{this.state.pages[fourthPageIndex]}</Text>
            <Text style={{
              width: Dimensions.get('window').width / 2,
              textAlign: 'center',
              lineHeight: 50,
              fontWeight: 'bold',
              fontSize: 30,
            }}>{this.state.pages[fifthPageIndex]}</Text>
            <View style={{
              width: Dimensions.get('window').width / 4
            }}></View>
          </ScrollView>
        </View>
        <ScrollView ref={scroll => this.sceneScroll = scroll} scrollEnabled={this.state.scrollEnabled} showsHorizontalScrollIndicator={true} contentOffset={{ x: this.sceneScrollMiddleOffset, y: 0 }} horizontal={true} scrollEventThrottle={16} pagingEnabled={true} style={{ backgroundColor: 'blue', flex: 1 }} onScroll={(native) => {
          this.onScroll(null, Math.round(native.nativeEvent.contentOffset.x), secondPageIndex, fourthPageIndex, firstPageIndex, fifthPageIndex);
        }}>
          <Text style={{
            width: Dimensions.get('window').width,
            textAlign: 'center',
            lineHeight: 50,
            fontWeight: 'bold',
            fontSize: 30,
          }}>{this.state.pages[firstPageIndex]}</Text>
          <Text style={{
            width: Dimensions.get('window').width,
            textAlign: 'center',
            lineHeight: 50,
            fontWeight: 'bold',
            fontSize: 30,
          }}>{this.state.pages[secondPageIndex]}</Text>
          <Text style={{
            width: Dimensions.get('window').width,
            textAlign: 'center',
            lineHeight: 50,
            fontWeight: 'bold',
            fontSize: 30,
          }}>{this.state.pages[thirdPageIndex]}</Text>
          <Text style={{
            width: Dimensions.get('window').width,
            textAlign: 'center',
            lineHeight: 50,
            fontWeight: 'bold',
            fontSize: 30,
          }}>{this.state.pages[fourthPageIndex]}</Text>
          <Text style={{
            width: Dimensions.get('window').width,
            textAlign: 'center',
            lineHeight: 50,
            fontWeight: 'bold',
            fontSize: 30,
          }}>{this.state.pages[fifthPageIndex]}</Text>
        </ScrollView>
      </View>
    );
  }
}