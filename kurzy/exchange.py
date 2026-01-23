import httpx

res = httpx.get('https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt')

print("server odpovedel:", res.status_code)
lines = res.text.split('\n')
print("Kruzy pro den:", lines[0].split(" ")[0])

line_euro = ""
for line in lines:
    if "EUR" in line:
        line_euro = line
        break

rate_str = line_euro.split('|')[-1].replace(',' , '.')
rate = float(rate_str)

print("Kurz eura je", rate)

value_in = float(input("Kolik mas eur?"))
value_out = value_in * rate

print(f"Tak to je {value_out:.2f} korun.")