import numpy as np
import mpmath as mp
import pandas as pd
from pandas.core.arrays.sparse import dtype
import xlwings as xw

from pathlib import Path


class RE24:

    def __init__(self):
        _pid = xw.apps.keys()
        self.data_path = Path.cwd() / 'data'
        self.app = xw.apps[_pid[0]]
        self.wb = self.app.books['PySabr.xlsm']
        self.re_sht = self.wb.sheets['RE24']

    def get_table_data(self):
        sht = self.re_sht
        re24_tbl = sht.tables['RE_24']
        df = re24_tbl.range.options(pd.DataFrame).value
        for base_state in df.index:
            print(df.loc[base_state])
        return df

    def write_conv(self):
        df = self.get_table_data()
        wrb = {'json': False, 'csv': False}
        if not (self.data_path / 're24.json').exists():
            df.to_json(self.data_path / 're24.json')
            wrb['json'] = 're24.json'
        if not (self.data_path / 're24.csv').exists():
            df.to_csv(self.data_path / 're24.csv')
            wrb['csv'] = 're24.csv'
        print('Wrote JSON ==> {0}'.format(wrb['json']))
        print('Wrote CSV  ==> {0}'.format(wrb['csv']))
        return wrb

    def get_linear_weights(self):
        df = self.get_table_data()




def main():
    wb = xw.Book.caller()
    sheet = wb.sheets[0]
    if sheet["A1"].value == "Hello xlwings!":
        sheet["A1"].value = "Bye xlwings!"
    else:
        sheet["A1"].value = "Hello xlwings!"


@xw.func
def hello(name):
    return f"Hello {name}!"


if __name__ == "__main__":
    # xw.Book("PySabr.xlsm").set_mock_caller()
    # main()
    re = RE24()
    d = re.get_table_data()
    w = re.write_conv()
    print(d.describe())
