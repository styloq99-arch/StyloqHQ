import sys
sys.path.insert(0, '.')

try:
    from app import create_app
    app = create_app()
    rules = sorted(str(r) for r in app.url_map.iter_rules() if '/static' not in str(r))
    with open('test_out.txt', 'w') as f:
        f.write('Backend OK\n')
        f.write('\n'.join(rules))
    print('OK - wrote test_out.txt')
except Exception as e:
    with open('test_out.txt', 'w') as f:
        f.write(f'ERROR: {e}\n')
        import traceback
        f.write(traceback.format_exc())
    print(f'ERROR: {e}')
