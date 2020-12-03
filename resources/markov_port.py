from collections import Counter

_outs_9 = 27.0
_bline_def = Counter(
    {
        'AB': 37,
        'H': 10,
        '2B': 2,
        '3B': 0,
        'HR': 1,
        'BB': 4,
        'SO': 7
    }
)

def calc_frqs(bline: Counter = _bline_def):

    bline['PA'] = bline['AB'] + bline['BB'];
    bline['OBE'] = bline['H'] + bline['BB'];
    bline['OUT'] = bline['PA'] - bline['OBE'];
    bline['1B'] = bline['H'] - sum([bline['2B'], bline['3B'], bline['HR']]);

    fq = {}
    freq_keys = ['OBE', 'BB', '1B', '2B', '3B', 'HR', 'SO', 'OUT']
    for fk in freq_keys:
        fq['fq' + fk] = bline[fk] / bline['PA'] * 1.0;

    fq['fqPA'] = (fq['fqOBE'] / fq['fqOUT']) * _outs_9 + _outs_9

    rt = {
        'rtBBO': 1 - fq['fqSO'] / fq['fqOUT'],
        'rtSLG': sum(list(map(lambda x, y: x * y, [1, 2, 3, 4], [fq['fq1B'], fq['fq2B'], fq['fq3B'], fq['fqHR']]))) / (1 - fq['fqBB']),
        'rtAVG': sum([fq['fq1B'], fq['fq2B'], fq['fq3B'], fq['fqHR']]) / (1 - fq['fqBB'])
    }

    return {'fqs': fq, 'rts': rt}


if __name__ == '__main__':
    cf = calc_frqs()
    print(cf)