import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Cell, Row, Table, TableWrapper} from '../table-component';
import {
  ElementCellRendered,
  ElementTitleCellRendered,
  ItemRenderedProps,
  UTableCommonItemBase,
} from '../UTable';

function ItemRendered<T extends UTableCommonItemBase>(
  props: ItemRenderedProps<T>,
) {
  const {
    title,
    refreshTitle = '刷新中',
    dataSource,
    column,
    instance: ref,
    loading = false,
    onRefresh,
  } = props;
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    (await onRefresh)?.();
    setRefreshing(false);
  }, []);

  /**
   * 表单头部渲染
   */
  const renderElementTitleCell: ElementTitleCellRendered<T> = (
    columnData,
    index,
  ) => {
    return (
      <View style={[styles.titleCellWrapper]}>
        {columnData.title ? (
          <Text style={styles.headerTitle}>{columnData.title}</Text>
        ) : (
          columnData.render?.({} as T, index, ref)
        )}
      </View>
    );
  };

  /**
   * 表单项渲染
   */
  const renderElementCell: ElementCellRendered<T> = (
    columnData,
    columnConfig,
    index,
  ) => {
    return (
      <View
        style={[
          styles.cellWrapper,
          {
            alignItems:
              columnConfig?.align === 'center'
                ? 'center'
                : columnConfig?.align === 'right'
                ? 'flex-end'
                : 'flex-start',
          },
        ]}>
        {columnConfig.render ? (
          columnConfig.render(columnData, index, ref)
        ) : (
          <Text>{columnData[columnConfig.dataIndex]}</Text>
        )}
      </View>
    );
  };

  const isHorizontalScroll: boolean = useMemo(
    () =>
      column.reduce((prev, curr) => prev + (curr?.width ?? 40), 0) >
      Dimensions.get('window').width,
    [column],
  );

  useEffect(() => {
    setRefreshing(loading);
  }, [loading]);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          title={refreshTitle}
          onRefresh={handleRefresh}
        />
      }
      horizontal={isHorizontalScroll}>
      {/* 表单渲染 */}
      <Table
        borderStyle={{
          borderWidth: 1,
          borderColor: '#ccc',
        }}>
        {!!title ? (
          <TableWrapper style={[styles.row, styles.formBackground]}>
            {/* 标题 */}
            <Row
              style={styles.formTitleWrapper}
              textStyle={styles.formTitle}
              data={[title]}
            />
          </TableWrapper>
        ) : (
          <TableWrapper />
        )}
        <TableWrapper style={[styles.row, styles.formBackground]}>
          {/* 表头 */}
          {column.map((rowData, index) => {
            return (
              <Cell
                key={rowData.dataIndex}
                width={rowData.width}
                data={renderElementTitleCell(rowData, index)}
              />
            );
          })}
        </TableWrapper>
        {/* 表格 */}
        {dataSource.map((rowData, rowIndex) => (
          <TableWrapper key={rowData.id} style={styles.row}>
            {/* 表项 */}
            {column.map((colConfig, index) => {
              return (
                <Cell
                  key={`${rowIndex}${index}`}
                  width={colConfig.width}
                  data={renderElementCell(rowData, colConfig, index)}
                />
              );
            })}
          </TableWrapper>
        ))}
      </Table>
    </ScrollView>
  );
}

export default ItemRendered;

const styles = StyleSheet.create({
  container: {flex: 1, paddingHorizontal: 16},
  row: {flexDirection: 'row'},
  formBackground: {
    backgroundColor: '#ffffff',
  },
  formTitleWrapper: {
    flex: 1,
  },
  formTitle: {
    paddingVertical: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  titleCellWrapper: {
    paddingVertical: 5,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  cellWrapper: {
    paddingHorizontal: 5,
    fontSize: 8,
  },
});
